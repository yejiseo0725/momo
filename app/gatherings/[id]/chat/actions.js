"use server";

import { createChatMessage } from "@/lib/chat";
import { createChatSocketToken } from "@/lib/chat-socket-token.mjs";
import { requireSession } from "@/lib/session";
import { ValidationError, readRequiredText } from "@/lib/utils/validation";

export async function sendChatMessageAction(formData) {
  const session = await requireSession();
  let gatheringId = "";
  let content;

  try {
    gatheringId = readRequiredText(formData, "gatheringId", "모임", 100);
    content = readRequiredText(formData, "content", "메시지", 1000);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: null };
    }
    throw error;
  }

  try {
    const authorName = session.user.nickname || session.user.name || "알 수 없는 사용자";
    const message = await createChatMessage(
      gatheringId,
      session.user.id,
      content,
      authorName,
    );
    const socketToken = createChatSocketToken(gatheringId, message);

    return { error: "", message, socketToken };
  } catch {
    return { error: "메시지를 보내지 못했습니다.", message: null, socketToken: "" };
  }
}
