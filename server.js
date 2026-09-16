import { createServer } from "node:http";
import next from "next";
import { ObjectId } from "mongodb";
import { Server } from "socket.io";
import { auth } from "./lib/auth.js";
import { validateChatContent, serializeChatMessage } from "./lib/chat.js";
import { db } from "./lib/mongodb.js";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

function createSocketHeaders(requestHeaders) {
  const socketHeaders = new Headers();

  for (const [name, value] of Object.entries(requestHeaders)) {
    if (typeof value === "string") {
      socketHeaders.set(name, value);
    } else if (Array.isArray(value)) {
      socketHeaders.set(name, value.join(", "));
    }
  }

  return socketHeaders;
}

async function findMembership(gatheringId, userId) {
  return db.collection("gatheringMembers").findOne({ gatheringId, userId });
}

async function findUserNickname(userId) {
  const userKeys = [userId];
  if (ObjectId.isValid(userId)) {
    userKeys.push(new ObjectId(userId));
  }
  const user = await db.collection("users").findOne({ _id: { $in: userKeys } });
  return user?.nickname || user?.name || "알 수 없는 멤버";
}

await nextApp.prepare();

const httpServer = createServer((request, response) => {
  handle(request, response);
});
const io = new Server(httpServer, {
  path: "/socket.io",
});

io.use(async (socket, nextSocket) => {
  try {
    const session = await auth.api.getSession({
      headers: createSocketHeaders(socket.request.headers),
    });

    if (!session) {
      nextSocket(new Error("로그인이 필요합니다."));
      return;
    }

    socket.data.user = session.user;
    nextSocket();
  } catch {
    nextSocket(new Error("세션을 확인할 수 없습니다."));
  }
});

io.on("connection", (socket) => {
  socket.on("chat:join", async ({ gatheringId }, respond = () => {}) => {
    try {
      if (!ObjectId.isValid(gatheringId)) {
        respond({ error: "올바르지 않은 모임입니다." });
        return;
      }

      const membership = await findMembership(gatheringId, socket.data.user.id);

      if (!membership) {
        respond({ error: "모임 멤버만 채팅에 참여할 수 있습니다." });
        return;
      }

      await socket.join(`gathering:${gatheringId}`);
      respond({ ok: true });
    } catch {
      respond({ error: "채팅방에 입장하지 못했습니다." });
    }
  });

  socket.on("chat:send", async ({ gatheringId, content }, respond = () => {}) => {
    try {
      const validation = validateChatContent(content);

      if (validation.error || !ObjectId.isValid(gatheringId)) {
        respond({ error: validation.error || "올바르지 않은 모임입니다." });
        return;
      }

      const membership = await findMembership(gatheringId, socket.data.user.id);

      if (!membership) {
        respond({ error: "모임 멤버만 메시지를 보낼 수 있습니다." });
        return;
      }

      const chatRoom = await db.collection("chatRooms").findOne({ gatheringId });

      if (!chatRoom) {
        respond({ error: "채팅방을 찾을 수 없습니다." });
        return;
      }

      const message = {
        chatRoomId: chatRoom._id.toString(),
        userId: socket.data.user.id,
        content: validation.content,
        createdAt: new Date(),
      };
      const insertResult = await db.collection("chatMessages").insertOne(message);
      const nickname = await findUserNickname(socket.data.user.id);
      const serializedMessage = serializeChatMessage(
        { ...message, _id: insertResult.insertedId },
        nickname,
      );

      io.to(`gathering:${gatheringId}`).emit("chat:message", serializedMessage);
      respond({ ok: true });
    } catch {
      respond({ error: "메시지를 전송하지 못했습니다." });
    }
  });
});

httpServer.listen(port, hostname, () => {
  console.log(`momo server ready on http://${hostname}:${port}`);
});
