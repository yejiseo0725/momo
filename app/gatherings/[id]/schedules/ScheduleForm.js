"use client";

import { useActionState, useState } from "react";

import {
  createScheduleAction,
  updateScheduleAction,
} from "@/app/gatherings/[id]/schedules/actions";
import FormMessage from "@/components/FormMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function ScheduleForm({ gatheringId, initialValues, mode, scheduleId }) {
  const action = mode === "create" ? createScheduleAction : updateScheduleAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [startDate, setStartDate] = useState(initialValues.startDate);
  const [endDate, setEndDate] = useState(initialValues.endDate);
  const [region, setRegion] = useState(initialValues.region);
  const idPrefix = mode === "create" ? "new-schedule" : `schedule-${scheduleId}`;

  return (
    <form action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {scheduleId ? <input type="hidden" name="scheduleId" value={scheduleId} /> : null}

      <label htmlFor={`${idPrefix}-title`}>제목</label>
      <input
        id={`${idPrefix}-title`}
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength="100"
        required
      />

      <label htmlFor={`${idPrefix}-description`}>설명</label>
      <textarea
        id={`${idPrefix}-description`}
        name="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength="1000"
        required
      />

      <label htmlFor={`${idPrefix}-start`}>시작일</label>
      <input
        id={`${idPrefix}-start`}
        name="startDate"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        required
      />

      <label htmlFor={`${idPrefix}-end`}>종료일</label>
      <input
        id={`${idPrefix}-end`}
        name="endDate"
        type="date"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        required
      />

      <label htmlFor={`${idPrefix}-region`}>장소</label>
      <input
        id={`${idPrefix}-region`}
        name="region"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        maxLength="150"
        required
      />

      <button type="submit" disabled={pending}>
        {pending
          ? (mode === "create" ? "만드는 중..." : "저장하는 중...")
          : (mode === "create" ? "일정 만들기" : "수정 저장")}
      </button>
      <FormMessage error={state.error} message={state.message} />
    </form>
  );
}
