'use client';

import {
  createChallengeAction,
  updateChallengeAction,
} from '@/app/gatherings/[id]/challenges/actions';
import {
  Button,
  Checkbox,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from '@heroui/react';
import { useActionState, useEffect, useState } from 'react';

import DateRangeField from '@/components/DateRangeField';
import HeroToast from '@/components/HeroToast';
import PlusIcon from '@/components/PlusIcon';

const initialActionState = {
  error: '',
  message: '',
  resetKey: 0,
};

function ChallengeFields({ idPrefix, initialValues }) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [useImage, setUseImage] = useState(initialValues.useImage);

  return (
    <>
      <TextField fullWidth isRequired name="title">
        <Label>제목</Label>
        <Input
          id={`${idPrefix}-title`}
          maxLength="100"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="description">
        <Label>설명</Label>
        <TextArea
          id={`${idPrefix}-description`}
          maxLength="1000"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </TextField>

      <Checkbox name="useImage" isSelected={useImage} onChange={setUseImage}>
        <Checkbox.Content>
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          인증할 때 이미지 파일 필수
        </Checkbox.Content>
      </Checkbox>

      <DateRangeField
        endDate={initialValues.endDate}
        startDate={initialValues.startDate}
      />
    </>
  );
}

export default function ChallengeForm({
  challengeId,
  gatheringId,
  initialValues,
  mode,
  onSuccess,
}) {
  const action =
    mode === 'create' ? createChallengeAction : updateChallengeAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );
  const idPrefix =
    mode === 'create' ? 'new-challenge' : `challenge-${challengeId}`;
  const fieldsKey = mode === 'create' ? state.resetKey : challengeId;

  useEffect(() => {
    if (state.message) {
      onSuccess?.();
    }
  }, [mode, onSuccess, state.message]);

  return (
    <Form className="flex w-full flex-col gap-4" action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {challengeId ? (
        <input type="hidden" name="challengeId" value={challengeId} />
      ) : null}

      <ChallengeFields
        key={fieldsKey}
        idPrefix={idPrefix}
        initialValues={initialValues}
      />

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {mode === 'create' ? <PlusIcon /> : null}
        {pending
          ? mode === 'create'
            ? '생성하는 중...'
            : '저장하는 중...'
          : mode === 'create'
            ? '챌린지 만들기'
            : '수정 저장'}
      </Button>
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
