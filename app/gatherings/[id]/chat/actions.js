"use server";

import { redirect } from "next/navigation";

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
      redirect(`/gatherings/${gatheringId}/chat?error=${encodeURIComponent(error.message)}`);
    }
    throw error;
  }

  try {
    await createChatMessage(gatheringId, session.user.id, content);
  } catch {
    redirect(`/gatherings/${gatheringId}/chat?error=${encodeURIComponent("메시지를 보내지 못했습니다.")}`);
  }

  redirect(`/gatherings/${gatheringId}/chat`);
}
