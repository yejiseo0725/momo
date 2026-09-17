import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_CHAT_MESSAGE_COUNT,
  mergeChatMessages,
} from "../app/gatherings/[id]/chat/chat-messages.mjs";

function createMessage(number, overrides = {}) {
  const id = number.toString(16).padStart(24, "0");

  return {
    id,
    userId: "660000000000000000000011",
    content: `메시지 ${number}`,
    createdAt: new Date(number * 1000).toISOString(),
    authorName: "모모",
    ...overrides,
  };
}

test("채팅 메시지는 ID를 기준으로 중복 없이 합친다", () => {
  const firstMessage = createMessage(1);
  const secondMessage = createMessage(2);
  const result = mergeChatMessages(
    [firstMessage],
    [firstMessage, secondMessage],
  );

  assert.deepEqual(result.messages, [firstMessage, secondMessage]);
  assert.deepEqual(result.addedMessages, [secondMessage]);
});

test("새 메시지가 없으면 기존 배열을 그대로 재사용한다", () => {
  const messages = [createMessage(1)];
  const result = mergeChatMessages(messages, [messages[0]]);

  assert.equal(result.messages, messages);
  assert.deepEqual(result.addedMessages, []);
});

test("채팅 메시지는 시간순으로 정렬하고 최신 100개만 유지한다", () => {
  const messages = Array.from(
    { length: MAX_CHAT_MESSAGE_COUNT },
    (_, index) => createMessage(index + 1),
  );
  const newestMessage = createMessage(MAX_CHAT_MESSAGE_COUNT + 1);
  const result = mergeChatMessages(messages, [newestMessage]);

  assert.equal(result.messages.length, MAX_CHAT_MESSAGE_COUNT);
  assert.equal(result.messages[0].id, createMessage(2).id);
  assert.equal(result.messages.at(-1).id, newestMessage.id);
});

test("같은 시각의 메시지는 ID 순서로 안정적으로 정렬한다", () => {
  const createdAt = new Date(1000).toISOString();
  const laterIdMessage = createMessage(2, { createdAt });
  const earlierIdMessage = createMessage(1, { createdAt });
  const result = mergeChatMessages([], [laterIdMessage, earlierIdMessage]);

  assert.deepEqual(result.messages, [earlierIdMessage, laterIdMessage]);
});
