import test from "node:test";
import assert from "node:assert/strict";

import {
  createChatSocketToken,
  verifyChatSocketToken,
} from "../lib/chat-socket-token.mjs";

const message = {
  id: "660000000000000000000099",
  userId: "660000000000000000000011",
  content: "안녕하세요",
  createdAt: "2026-09-17T08:00:00.000Z",
  authorName: "모모",
};

test("서명된 채팅 소켓 토큰은 메시지 내용을 복원한다", () => {
  const token = createChatSocketToken("660000000000000000000001", message, 1_000);
  const payload = verifyChatSocketToken(token, 2_000);

  assert.equal(payload.gatheringId, "660000000000000000000001");
  assert.deepEqual(payload.message, message);
});

test("변조되거나 만료된 채팅 소켓 토큰을 거부한다", () => {
  const token = createChatSocketToken("660000000000000000000001", message, 1_000);
  const changedToken = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;

  assert.equal(verifyChatSocketToken(changedToken, 2_000), null);
  assert.equal(verifyChatSocketToken(token, 31_001), null);
});

test("한글 1000자 메시지도 소켓 토큰으로 전달한다", () => {
  const longMessage = { ...message, content: "가".repeat(1_000) };
  const token = createChatSocketToken("660000000000000000000001", longMessage, 1_000);

  assert.deepEqual(verifyChatSocketToken(token, 2_000)?.message, longMessage);
});
