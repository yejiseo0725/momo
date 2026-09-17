"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  GatheringError,
  createGathering,
  joinGathering,
  joinGatheringByInvitation,
  leaveGathering,
  updateGathering,
} from "@/lib/gatherings";
import { requireSession } from "@/lib/session";
import {
  CATEGORIES,
  ValidationError,
  readEnum,
  readInteger,
  readRequiredText,
} from "@/lib/utils/validation";

function readGatheringInput(formData) {
  return {
    name: readRequiredText(formData, "name", "모임명", 80),
    region: readRequiredText(formData, "region", "지역", 100),
    description: readRequiredText(formData, "description", "소개", 1000),
    maxMemCount: readInteger(formData, "maxMemCount", "최대 인원", 1, 300),
    category: readEnum(formData, "category", "카테고리", CATEGORIES),
    isPublic: readEnum(formData, "visibility", "공개 여부", ["public", "private"]) === "public",
  };
}

function getGatheringId(formData) {
  return readRequiredText(formData, "gatheringId", "모임", 100);
}

function redirectWithError(pathname, message) {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}

export async function createGatheringAction(formData) {
  const session = await requireSession();
  let input;

  try {
    input = readGatheringInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      redirectWithError("/gatherings/new", error.message);
    }
    throw error;
  }

  let gatheringId;
  try {
    gatheringId = await createGathering(session.user.id, input);
  } catch {
    redirectWithError("/gatherings/new", "모임을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  redirect(`/gatherings/${gatheringId}?message=${encodeURIComponent("모임을 만들었습니다.")}`);
}

export async function updateGatheringAction(formData) {
  const session = await requireSession();
  let gatheringId;
  let input;

  try {
    gatheringId = getGatheringId(formData);
    input = readGatheringInput(formData);
  } catch (error) {
    const fallbackId = formData.get("gatheringId") || "";
    if (error instanceof ValidationError) {
      redirectWithError(`/gatherings/${fallbackId}/edit`, error.message);
    }
    throw error;
  }

  try {
    await updateGathering(gatheringId, session.user.id, input);
  } catch (error) {
    const message = error instanceof GatheringError
      ? error.message
      : "모임을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    redirectWithError(`/gatherings/${gatheringId}/edit`, message);
  }

  revalidatePath(`/gatherings/${gatheringId}`, "layout");
  redirect(`/gatherings/${gatheringId}?message=${encodeURIComponent("모임 정보를 수정했습니다.")}`);
}

export async function joinGatheringAction(formData) {
  const session = await requireSession();
  const gatheringId = getGatheringId(formData);

  try {
    await joinGathering(gatheringId, session.user.id);
  } catch (error) {
    const message = error instanceof GatheringError
      ? error.message
      : "모임에 가입하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    redirectWithError(`/gatherings/${gatheringId}`, message);
  }

  revalidatePath(`/gatherings/${gatheringId}`, "layout");
  redirect(`/gatherings/${gatheringId}?message=${encodeURIComponent("모임에 가입했습니다.")}`);
}

export async function joinGatheringByInvitationAction(formData) {
  const session = await requireSession();
  let inviteToken = "";

  try {
    inviteToken = readRequiredText(formData, "inviteToken", "초대 URL", 100);
  } catch (error) {
    const message = error instanceof ValidationError
      ? error.message
      : "초대 URL을 확인하지 못했습니다.";
    redirectWithError("/", message);
  }

  let gatheringId;
  try {
    gatheringId = await joinGatheringByInvitation(inviteToken, session.user.id);
  } catch (error) {
    const message = error instanceof GatheringError
      ? error.message
      : "모임에 가입하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    redirectWithError(`/invite/${inviteToken}`, message);
  }

  revalidatePath(`/gatherings/${gatheringId}`, "layout");
  redirect(`/gatherings/${gatheringId}?message=${encodeURIComponent("모임에 가입했습니다.")}`);
}

export async function leaveGatheringAction(formData) {
  const session = await requireSession();
  const gatheringId = getGatheringId(formData);

  try {
    await leaveGathering(gatheringId, session.user.id);
  } catch (error) {
    const message = error instanceof GatheringError
      ? error.message
      : "모임을 탈퇴하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    redirectWithError(`/gatherings/${gatheringId}`, message);
  }

  revalidatePath(`/gatherings/${gatheringId}`, "layout");
  redirect(`/my-gatherings?message=${encodeURIComponent("모임에서 탈퇴했습니다.")}`);
}
