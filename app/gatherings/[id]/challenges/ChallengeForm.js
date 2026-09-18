'use client';

import {
  createChallengeAction,
  updateChallengeAction,
} from '@/app/gatherings/[id]/challenges/actions';
import {
  Button,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { useActionState, useEffect, useState } from 'react';

import DateRangeField from '@/components/DateRangeField';
import HeroToast from '@/components/HeroToast';

const initialActionState = {
  error: '',
  message: '',
  resetKey: 0,
};

function ChallengeFields({ idPrefix, initialValues }) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [authType, setAuthType] = useState(
    initialValues.useImage ? 'image' : 'text',
  );

  function handleAuthTypeChange(keys) {
    const nextKey = Array.from(keys)[0];
    if (nextKey) {
      setAuthType(nextKey);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label>인증 방식</Label>
        <ToggleButtonGroup
          className="w-full flex"
          disallowEmptySelection
          fullWidth
          selectedKeys={new Set([authType])}
          selectionMode="single"
          onSelectionChange={handleAuthTypeChange}
        >
          <ToggleButton
            className="flex-1 data-[selected=true]:bg-tertiary data-[selected=true]:text-tertiary-foreground data-[selected=true]:font-semibold"
            id="text"
          >
            텍스트 인증
          </ToggleButton>
          <ToggleButtonGroup.Separator />
          <ToggleButton
            className="flex-1 data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:font-semibold"
            id="image"
          >
            이미지 인증
          </ToggleButton>
        </ToggleButtonGroup>
        <input
          type="hidden"
          name="useImage"
          value={authType === 'image' ? 'on' : ''}
        />
      </div>

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

      <DateRangeField
        endDate={initialValues.endDate}
        startDate={initialValues.startDate}
      />
    </>
  );
}

export default function ChallengeForm({
  actionButtons,
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

      {actionButtons ? (
        typeof actionButtons === 'function'
          ? actionButtons({ pending })
          : actionButtons
      ) : (
        <Button
          className="w-full"
          type="submit"
          isDisabled={pending}
          isPending={pending}
        >
          {pending
            ? mode === 'create'
              ? '생성하는 중...'
              : '저장하는 중...'
            : mode === 'create'
              ? '챌린지 만들기'
              : '수정 완료'}
        </Button>
      )}
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
