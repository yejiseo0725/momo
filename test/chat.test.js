import assert from "node:assert/strict";
import test from "node:test";
import { serializeChatMessage, validateChatContent } from "../lib/chat.js";

test("채팅 메시지 앞뒤 공백을 제거한다", () => {
  assert.deepEqual(validateChatContent("  안녕하세요  "), {
    content: "안녕하세요",
  });
});

test("빈 채팅 메시지를 거절한다", () => {
  assert.equal(validateChatContent("   ").error, "메시지를 입력해 주세요.");
});

test("DB 메시지를 클라이언트 전송 형태로 바꾼다", () => {
  const message = serializeChatMessage(
    {
      _id: { toString: () => "message-id" },
      userId: "user-id",
      content: "반가워요",
      createdAt: new Date("2026-09-16T00:00:00.000Z"),
    },
    "모모",
  );

  assert.deepEqual(message, {
    id: "message-id",
    userId: "user-id",
    nickname: "모모",
    content: "반가워요",
    createdAt: "2026-09-16T00:00:00.000Z",
  });
});
