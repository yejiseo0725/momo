"use server";

import { createChatMessage } from "@/lib/chat";
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
    const message = await createChatMessage(gatheringId, session.user.id, content);
    return { error: "", message };
  } catch {
    return { error: "메시지를 보내지 못했습니다.", message: null };
  }
}
