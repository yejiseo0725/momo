"use client";

import {
  Button,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { useActionState, useState } from "react";

import {
  createScheduleAction,
  updateScheduleAction,
} from "@/app/gatherings/[id]/schedules/actions";
import ToastMessage from "@/components/ToastMessage";

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
  const [location, setLocation] = useState(initialValues.location);
  const idPrefix = mode === "create" ? "new-schedule" : `schedule-${scheduleId}`;

  return (
    <Form className="flex w-full flex-col gap-4" action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {scheduleId ? <input type="hidden" name="scheduleId" value={scheduleId} /> : null}

      <TextField fullWidth isRequired name="title">
        <Label>제목</Label>
        <Input
          id={`${idPrefix}-title`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength="100"
        />
      </TextField>

      <TextField fullWidth isRequired name="description">
        <Label>설명</Label>
        <TextArea
          id={`${idPrefix}-description`}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength="1000"
        />
      </TextField>

      <TextField fullWidth isRequired name="startDate" type="date">
        <Label>시작일</Label>
        <Input
          id={`${idPrefix}-start`}
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="endDate" type="date">
        <Label>종료일</Label>
        <Input
          id={`${idPrefix}-end`}
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="location">
        <Label>장소</Label>
        <Input
          id={`${idPrefix}-location`}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          maxLength="150"
        />
      </TextField>

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending
          ? (mode === "create" ? "만드는 중..." : "저장하는 중...")
          : (mode === "create" ? "일정 만들기" : "수정 저장")}
      </Button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
