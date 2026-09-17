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

const nextApplication = next({
  dev: !isProduction,
  hostname,
  port,
});
const requestHandler = nextApplication.getRequestHandler();

nextApplication.prepare().then(() => {
  const httpServer = createServer((request, response) => {
    requestHandler(request, response);
  });

  const socketServer = new Server(httpServer, {
    path: "/socket.io",
  });

  // 소켓에는 메시지 내용을 싣지 않는다. 새 메시지가 생겼다는 신호만 보내고,
  // 수신한 브라우저가 인증된 API를 통해 최신 메시지를 다시 조회하도록 한다.
  socketServer.on("connection", (socket) => {
    socket.on("join-gathering", (gatheringId) => {
      if (typeof gatheringId !== "string" || gatheringId.length > 100) {
        return;
      }

      socket.join(`gathering:${gatheringId}`);
    });

    socket.on("notify-message-created", (gatheringId) => {
      if (typeof gatheringId !== "string" || gatheringId.length > 100) {
        return;
      }

      socket.to(`gathering:${gatheringId}`).emit("message-created", { gatheringId });
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`momo server: http://${hostname}:${port}`);
  });
});
