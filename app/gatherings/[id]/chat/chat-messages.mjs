export const MAX_CHAT_MESSAGE_COUNT = 100;

function compareMessages(left, right) {
  return left.createdAt.localeCompare(right.createdAt)
    || left.id.localeCompare(right.id);
}

export function mergeChatMessages(currentMessages, incomingMessages) {
  const messagesById = new Map(
    currentMessages.map((message) => [message.id, message]),
  );
  const addedMessages = [];

  for (const message of incomingMessages) {
    if (messagesById.has(message.id)) {
      continue;
    }

    messagesById.set(message.id, message);
    addedMessages.push(message);
  }

  if (addedMessages.length === 0) {
    return { addedMessages, messages: currentMessages };
  }

  const messages = [...messagesById.values()]
    .sort(compareMessages)
    .slice(-MAX_CHAT_MESSAGE_COUNT);

  return { addedMessages, messages };
}
