"use server";

import { revalidatePath } from "next/cache";

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
    region: readRequiredText(formData, "region", "장소", 150),
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
    return {
      error: error instanceof ScheduleError ? error.message : "일정을 만들지 못했습니다.",
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
    return {
      error: error instanceof ScheduleError ? error.message : "일정을 수정하지 못했습니다.",
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
    redirectWithError(
      `/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`,
      error instanceof ScheduleError ? error.message : "일정을 삭제하지 못했습니다.",
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
    return {
      error: error instanceof ScheduleError ? error.message : "일정 참여를 저장하지 못했습니다.",
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
    return {
      error: error instanceof ScheduleError ? error.message : "일정 참여를 취소하지 못했습니다.",
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`);
  return { error: "", message: "일정 참여를 취소했습니다." };
}
