'use client';

import {
  createScheduleAction,
  updateScheduleAction,
} from '@/app/gatherings/[id]/schedules/actions';
import { Button, Form, Input, Label, TextArea, TextField } from '@heroui/react';
import { useActionState, useEffect, useState } from 'react';

import DateRangeField from '@/components/DateRangeField';
import HeroToast from '@/components/HeroToast';

const initialActionState = {
  error: '',
  message: '',
};

export default function ScheduleForm({
  actionButtons,
  gatheringId,
  initialValues,
  mode,
  onSuccess,
  scheduleId,
}) {
  const action =
    mode === 'create' ? createScheduleAction : updateScheduleAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [location, setLocation] = useState(initialValues.location);
  const idPrefix =
    mode === 'create' ? 'new-schedule' : `schedule-${scheduleId}`;

  useEffect(() => {
    if (state.message) {
      onSuccess?.();
    }
  }, [onSuccess, state.message]);

  return (
    <Form className="flex w-full flex-col gap-4" action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {scheduleId ? (
        <input type="hidden" name="scheduleId" value={scheduleId} />
      ) : null}

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

      <DateRangeField
        endDate={initialValues.endDate}
        startDate={initialValues.startDate}
      />

      <TextField fullWidth isRequired name="location">
        <Label>장소</Label>
        <Input
          id={`${idPrefix}-location`}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          maxLength="150"
        />
      </TextField>

      {actionButtons ? (
        typeof actionButtons === 'function' ? actionButtons({ pending }) : actionButtons
      ) : (
        <Button
          className="w-full"
          type="submit"
          isDisabled={pending}
          isPending={pending}
        >
          {pending
            ? mode === 'create'
              ? '만드는 중...'
              : '저장하는 중...'
            : mode === 'create'
              ? '일정 만들기'
              : '수정 완료'}
        </Button>
      )}
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
