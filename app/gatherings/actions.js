"use server";

import { revalidatePath } from "next/cache";

import {
  GatheringCreationError,
  GatheringError,
  createGathering,
  joinGathering,
  joinGatheringByInvitation,
  leaveGathering,
  updateGathering,
} from "@/lib/gatherings";
import { redirectWithError, redirectWithSuccess } from "@/lib/redirects";
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

export async function createGatheringAction(_previousState, formData) {
  const session = await requireSession();
  let input;

  try {
    input = readGatheringInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  let gatheringId;
  try {
    gatheringId = await createGathering(session.user.id, input);
  } catch (error) {
    const failedCollection = error instanceof GatheringCreationError
      ? error.collectionName
      : "unknown";
    const originalError = error instanceof GatheringCreationError
      ? error.cause
      : error;

    console.error(
      `[createGatheringAction] ${failedCollection} 저장 실패`,
      originalError,
    );

    return {
      error: "모임을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.",
      message: "",
    };
  }

  redirectWithSuccess(`/gatherings/${gatheringId}`, "모임을 만들었습니다.");
}

export async function updateGatheringAction(_previousState, formData) {
  const session = await requireSession();
  let gatheringId;
  let input;

  try {
    gatheringId = getGatheringId(formData);
    input = readGatheringInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await updateGathering(gatheringId, session.user.id, input);
  } catch (error) {
    const message = error instanceof GatheringError
      ? error.message
      : "모임을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return { error: message, message: "" };
  }

  revalidatePath(`/gatherings/${gatheringId}`, "layout");
  redirectWithSuccess(`/gatherings/${gatheringId}`, "모임 정보를 수정했습니다.");
}

export async function joinGatheringAction(_previousState, formData) {
  const session = await requireSession();
  const gatheringId = getGatheringId(formData);

  try {
    await joinGathering(gatheringId, session.user.id);
  } catch (error) {
    const message = error instanceof GatheringError
      ? error.message
      : "모임에 가입하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return { error: message, message: "" };
  }

  revalidatePath(`/gatherings/${gatheringId}`, "layout");
  return { error: "", message: "모임에 가입했습니다." };
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
  redirectWithSuccess(`/gatherings/${gatheringId}`, "모임에 가입했습니다.");
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
  redirectWithSuccess("/my-gatherings", "모임에서 탈퇴했습니다.");
}
