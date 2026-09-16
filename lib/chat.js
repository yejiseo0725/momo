export function validateChatContent(value) {
  const content = String(value || "").trim();

  if (!content) {
    return { error: "메시지를 입력해 주세요." };
  }

  if (content.length > 1000) {
    return { error: "메시지는 1,000자 이하로 입력해 주세요." };
  }

  return { content };
}

export function serializeChatMessage(message, nickname) {
  return {
    id: message._id.toString(),
    userId: message.userId,
    nickname,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}
