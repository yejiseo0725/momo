"use server";

import { revalidatePath } from "next/cache";

import {
  ChallengeError,
  createChallenge,
  createChallengeFeed,
  deleteChallenge,
  updateChallenge,
} from "@/lib/challenges";
import { GatheringError } from "@/lib/gatherings";
import { redirectWithError, redirectWithSuccess } from "@/lib/redirects";
import { requireSession } from "@/lib/session";
import {
  ValidationError,
  readDateOnly,
  readRequiredText,
  validateDateRange,
} from "@/lib/utils/validation";

function getIds(formData) {
  return {
    gatheringId: readRequiredText(formData, "gatheringId", "모임", 100),
    challengeId: formData.has("challengeId")
      ? readRequiredText(formData, "challengeId", "챌린지", 100)
      : "",
  };
}

function readChallengeInput(formData) {
  const startDate = readDateOnly(formData, "startDate", "시작일");
  const endDate = readDateOnly(formData, "endDate", "종료일");
  validateDateRange(startDate, endDate);

  return {
    title: readRequiredText(formData, "title", "제목", 100),
    description: readRequiredText(formData, "description", "설명", 1000),
    useImage: formData.get("useImage") === "on",
    startDate,
    endDate,
  };
}

export async function createChallengeAction(previousState, formData) {
  const session = await requireSession();
  const resetKey = Number.isSafeInteger(previousState.resetKey) ? previousState.resetKey : 0;
  let gatheringId = "";
  let input;

  try {
    ({ gatheringId } = getIds(formData));
    input = readChallengeInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "", resetKey };
    }
    throw error;
  }

  try {
    await createChallenge(gatheringId, session.user.id, input);
  } catch (error) {
    console.error("[createChallengeAction] 실패:", error);
    const message = error instanceof ChallengeError || error instanceof GatheringError
      ? error.message
      : "챌린지를 만들지 못했습니다.";
    return {
      error: message,
      message: "",
      resetKey,
    };
  }
  revalidatePath(`/gatherings/${gatheringId}/challenges`);
  return { error: "", message: "챌린지를 만들었습니다.", resetKey: resetKey + 1 };
}

export async function updateChallengeAction(_previousState, formData) {
  const session = await requireSession();
  let ids = { gatheringId: "", challengeId: "" };
  let input;

  try {
    ids = getIds(formData);
    input = readChallengeInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await updateChallenge(ids.challengeId, ids.gatheringId, session.user.id, input);
  } catch (error) {
    console.error("[updateChallengeAction] 실패:", error);
    const message = error instanceof ChallengeError || error instanceof GatheringError
      ? error.message
      : "챌린지를 수정하지 못했습니다.";
    return {
      error: message,
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/challenges`);
  revalidatePath(`/gatherings/${ids.gatheringId}/challenges/${ids.challengeId}`);
  return { error: "", message: "챌린지를 수정했습니다." };
}

export async function deleteChallengeAction(formData) {
  const session = await requireSession();
  const ids = getIds(formData);

  try {
    await deleteChallenge(ids.challengeId, ids.gatheringId, session.user.id);
  } catch (error) {
    console.error("[deleteChallengeAction] 실패:", error);
    const message = error instanceof ChallengeError || error instanceof GatheringError
      ? error.message
      : "챌린지를 삭제하지 못했습니다.";
    redirectWithError(
      `/gatherings/${ids.gatheringId}/challenges/${ids.challengeId}`,
      message,
    );
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/challenges`);
  redirectWithSuccess(
    `/gatherings/${ids.gatheringId}/challenges`,
    "챌린지를 삭제했습니다.",
  );
}

export async function createChallengeFeedAction(previousState, formData) {
  const session = await requireSession();
  const resetKey = Number.isSafeInteger(previousState.resetKey) ? previousState.resetKey : 0;
  let ids = { gatheringId: "", challengeId: "" };
  let input;

  try {
    ids = getIds(formData);
    input = {
      doneDate: readDateOnly(formData, "doneDate", "인증일"),
      imageFile: formData.get("image"),
      description: readRequiredText(formData, "description", "인증 내용", 500),
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "", resetKey };
    }
    throw error;
  }

  try {
    await createChallengeFeed(ids.challengeId, ids.gatheringId, session.user.id, input);
  } catch (error) {
    console.error("[createChallengeFeedAction] 실패:", error);
    const message = error instanceof ChallengeError || error instanceof GatheringError
      ? error.message
      : "챌린지를 인증하지 못했습니다.";
    return {
      error: message,
      message: "",
      resetKey,
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/challenges`);
  revalidatePath(`/gatherings/${ids.gatheringId}/challenges/${ids.challengeId}`);
  return { error: "", message: "챌린지를 인증했습니다.", resetKey: resetKey + 1 };
}
