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
  // 브라우저가 Server Component를 다시 요청하도록 한다.
  socketServer.on("connection", (socket) => {
    socket.on("join-gathering", (gatheringId) => {
      if (typeof gatheringId !== "string" || gatheringId.length > 100) {
        return;
      }

      socket.join(`gathering:${gatheringId}`);
    });
  });

  globalThis.momoSocketServer = socketServer;

  httpServer.listen(port, hostname, () => {
    console.log(`momo server: http://${hostname}:${port}`);
  });
});
