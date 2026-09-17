"use strict";

const isProduction = process.argv.includes("--production");
if (isProduction) {
  process.env.NODE_ENV = "production";
}

const { createServer } = require("node:http");
const next = require("next");
const { Server } = require("socket.io");

const hostname = process.env.HOSTNAME || "localhost";
const port = Number.parseInt(process.env.PORT || "3000", 10);
const socketAccessHostname = ["0.0.0.0", "::"].includes(hostname) ? "127.0.0.1" : hostname;
const socketAccessHost = socketAccessHostname.includes(":")
  ? `[${socketAccessHostname}]`
  : socketAccessHostname;

const nextApplication = next({
  dev: !isProduction,
  hostname,
  port,
});
const requestHandler = nextApplication.getRequestHandler();

nextApplication.prepare().then(async () => {
  const { verifyChatSocketToken } = await import("./lib/chat-socket-token.mjs");
  const httpServer = createServer((request, response) => {
    requestHandler(request, response);
  });

  const socketServer = new Server(httpServer, {
    path: "/socket.io",
    maxHttpBufferSize: 16_384,
    perMessageDeflate: false,
  });

  const usedNotificationTokens = new Map();

  function rememberNotificationToken(token, expiresAt) {
    const now = Date.now();

    for (const [usedToken, expiration] of usedNotificationTokens) {
      if (expiration >= now) {
        break;
      }
      usedNotificationTokens.delete(usedToken);
    }

    if (usedNotificationTokens.has(token)) {
      return false;
    }

    usedNotificationTokens.set(token, expiresAt);
    if (usedNotificationTokens.size > 10_000) {
      usedNotificationTokens.delete(usedNotificationTokens.keys().next().value);
    }
    return true;
  }

  async function canJoinGathering(socket, gatheringId) {
    const cookie = socket.handshake.headers.cookie || "";
    const response = await fetch(
      `http://${socketAccessHost}:${port}/api/gatherings/${encodeURIComponent(gatheringId)}/chat/socket-access`,
      {
        headers: { cookie },
        signal: AbortSignal.timeout(3_000),
      },
    );

    return response.ok;
  }

  socketServer.on("connection", (socket) => {
    socket.data.allowedGatherings = new Set();
    socket.data.joinWindow = { startedAt: Date.now(), count: 0 };
    socket.data.notificationWindow = { startedAt: Date.now(), count: 0 };

    socket.on("join-gathering", async (gatheringId, acknowledge) => {
      const now = Date.now();
      const window = socket.data.joinWindow;
      if (now - window.startedAt >= 10_000) {
        window.startedAt = now;
        window.count = 0;
      }
      window.count += 1;

      if (
        typeof gatheringId !== "string"
        || !/^[a-f\d]{24}$/i.test(gatheringId)
        || window.count > 10
      ) {
        if (typeof acknowledge === "function") {
          acknowledge({ allowed: false });
        }
        return;
      }

      try {
        const allowed = await canJoinGathering(socket, gatheringId);
        if (!allowed) {
          if (typeof acknowledge === "function") {
            acknowledge({ allowed: false });
          }
          return;
        }

        socket.data.allowedGatherings.add(gatheringId);
        socket.join(`gathering:${gatheringId}`);

        if (typeof acknowledge === "function") {
          acknowledge({ allowed: true });
        }
      } catch {
        if (typeof acknowledge === "function") {
          acknowledge({ allowed: false });
        }
      }
    });

    socket.on("notify-message-created", async (token) => {
      const now = Date.now();
      const window = socket.data.notificationWindow;
      if (now - window.startedAt >= 10_000) {
        window.startedAt = now;
        window.count = 0;
      }
      window.count += 1;

      if (window.count > 20) {
        return;
      }

      const payload = verifyChatSocketToken(token, now);
      if (!payload) {
        return;
      }

      if (!socket.data.allowedGatherings.has(payload.gatheringId)) {
        try {
          const allowed = await canJoinGathering(socket, payload.gatheringId);
          if (!allowed) {
            return;
          }
          socket.data.allowedGatherings.add(payload.gatheringId);
          socket.join(`gathering:${payload.gatheringId}`);
        } catch {
          return;
        }
      }

      if (!rememberNotificationToken(token, payload.expiresAt)) {
        return;
      }

      socket.to(`gathering:${payload.gatheringId}`).emit("message-created", {
        gatheringId: payload.gatheringId,
        message: payload.message,
      });
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`momo server: http://${hostname}:${port}`);
  });
});
