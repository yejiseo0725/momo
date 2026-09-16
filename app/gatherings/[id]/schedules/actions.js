"use server";

import { redirect } from "next/navigation";

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

function fail(pathname, message) {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}

export async function createScheduleAction(formData) {
  const session = await requireSession();
  let gatheringId = "";
  let input;

  try {
    ({ gatheringId } = readIds(formData));
    input = readScheduleInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      fail(`/gatherings/${gatheringId}/schedules`, error.message);
    }
    throw error;
  }

  let scheduleId;
  try {
    scheduleId = await createSchedule(gatheringId, session.user.id, input);
  } catch (error) {
    fail(`/gatherings/${gatheringId}/schedules`, error instanceof ScheduleError ? error.message : "일정을 만들지 못했습니다.");
  }
  redirect(`/gatherings/${gatheringId}/schedules/${scheduleId}?message=${encodeURIComponent("일정을 만들었습니다.")}`);
}

export async function updateScheduleAction(formData) {
  const session = await requireSession();
  let ids = { gatheringId: "", scheduleId: "" };
  let input;

  try {
    ids = readIds(formData);
    input = readScheduleInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      fail(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`, error.message);
    }
    throw error;
  }

  try {
    await updateSchedule(ids.scheduleId, ids.gatheringId, session.user.id, input);
  } catch (error) {
    fail(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`, error instanceof ScheduleError ? error.message : "일정을 수정하지 못했습니다.");
  }
  redirect(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}?message=${encodeURIComponent("일정을 수정했습니다.")}`);
}

export async function deleteScheduleAction(formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await deleteSchedule(ids.scheduleId, ids.gatheringId, session.user.id);
  } catch (error) {
    fail(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`, error instanceof ScheduleError ? error.message : "일정을 삭제하지 못했습니다.");
  }
  redirect(`/gatherings/${ids.gatheringId}/schedules?message=${encodeURIComponent("일정을 삭제했습니다.")}`);
}

export async function joinScheduleAction(formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await joinSchedule(ids.scheduleId, ids.gatheringId, session.user.id);
  } catch (error) {
    fail(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`, error instanceof ScheduleError ? error.message : "일정 참여를 저장하지 못했습니다.");
  }
  redirect(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}?message=${encodeURIComponent("일정에 참여합니다.")}`);
}

export async function leaveScheduleAction(formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await leaveSchedule(ids.scheduleId, ids.gatheringId, session.user.id);
  } catch (error) {
    fail(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}`, error instanceof ScheduleError ? error.message : "일정 참여를 취소하지 못했습니다.");
  }
  redirect(`/gatherings/${ids.gatheringId}/schedules/${ids.scheduleId}?message=${encodeURIComponent("일정 참여를 취소했습니다.")}`);
}
