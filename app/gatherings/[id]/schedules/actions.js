"use server";

import { revalidatePath } from "next/cache";

import { GatheringError } from "@/lib/gatherings";
import { redirectWithError, redirectWithSuccess } from "@/lib/redirects";
import { requireSession } from "@/lib/session";
import {
  ScheduleError,
  createSchedule,
  deleteSchedule,
  joinSchedule,
  leaveSchedule,
  updateSchedule,
} from "@/lib/schedules";
import {
  ValidationError,
  readDateOnly,
  readRequiredText,
  validateDateRange,
} from "@/lib/utils/validation";

function readIds(formData) {
  return {
    gatheringId: readRequiredText(formData, "gatheringId", "모임", 100),
    scheduleId: formData.has("scheduleId")
      ? readRequiredText(formData, "scheduleId", "일정", 100)
      : "",
  };
}

function readScheduleInput(formData) {
  const startDate = readDateOnly(formData, "startDate", "시작일");
  const endDate = readDateOnly(formData, "endDate", "종료일");
  validateDateRange(startDate, endDate);
  return {
    title: readRequiredText(formData, "title", "제목", 100),
    description: readRequiredText(formData, "description", "설명", 1000),
    startDate,
    endDate,
    location: readRequiredText(formData, "location", "장소", 150),
  };
}

export async function createScheduleAction(_previousState, formData) {
  const session = await requireSession();
  let gatheringId = "";
  let input;

  try {
    ({ gatheringId } = readIds(formData));
    input = readScheduleInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  let scheduleId;
  try {
    scheduleId = await createSchedule(gatheringId, session.user.id, input);
  } catch (error) {
    console.error("[createScheduleAction] 일정 생성 실패:", error);
    if (error?.errInfo) {
      console.error("[createScheduleAction] Schema Validation Details:", JSON.stringify(error.errInfo, null, 2));
    }
    const message = error instanceof ScheduleError || error instanceof GatheringError
      ? error.message
      : "일정을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return {
      error: message,
      message: "",
    };
  }
  redirectWithSuccess(
    `/gatherings/${gatheringId}/schedules/${scheduleId}`,
    "일정을 만들었습니다.",
  );
}

export async function updateScheduleAction(_previousState, formData) {
  const session = await requireSession();
  let ids = { gatheringId: "", scheduleId: "" };
  let input;

  try {
    ids = readIds(formData);
    input = readScheduleInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await updateSchedule(ids.scheduleId, ids.gatheringId, session.user.id, input);
  } catch (error) {
    console.error("[updateScheduleAction] 일정 수정 실패:", error);
    const message = error instanceof ScheduleError || error instanceof GatheringError
      ? error.message
      : "일정을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return {
      error: message,
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`);
  return { error: "", message: "일정을 수정했습니다." };
}

export async function deleteScheduleAction(formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await deleteSchedule(ids.scheduleId, ids.gatheringId, session.user.id);
  } catch (error) {
    console.error("[deleteScheduleAction] 일정 삭제 실패:", error);
    const message = error instanceof ScheduleError || error instanceof GatheringError
      ? error.message
      : "일정을 삭제하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    redirectWithError(
      `/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`,
      message,
    );
  }
  redirectWithSuccess(
    `/gatherings/${ids.gatheringId}/schedules`,
    "일정을 삭제했습니다.",
  );
}

export async function joinScheduleAction(_previousState, formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await joinSchedule(ids.scheduleId, ids.gatheringId, session.user.id);
  } catch (error) {
    console.error("[joinScheduleAction] 일정 참여 실패:", error);
    const message = error instanceof ScheduleError || error instanceof GatheringError
      ? error.message
      : "일정 참여를 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return {
      error: message,
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`);
  return { error: "", message: "일정에 참여합니다." };
}

export async function leaveScheduleAction(_previousState, formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await leaveSchedule(ids.scheduleId, ids.gatheringId, session.user.id);
  } catch (error) {
    console.error("[leaveScheduleAction] 일정 참여 취소 실패:", error);
    const message = error instanceof ScheduleError || error instanceof GatheringError
      ? error.message
      : "일정 참여를 취소하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    return {
      error: message,
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`);
  return { error: "", message: "일정 참여를 취소했습니다." };
}
