"use client";

import {
  Button,
  Checkbox,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
} from "@heroui/react";
import { useActionState, useState } from "react";

import {
  createChallengeAction,
  updateChallengeAction,
} from "@/app/gatherings/[id]/challenges/actions";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
  resetKey: 0,
};

function ChallengeFields({ idPrefix, initialValues }) {
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [useImage, setUseImage] = useState(initialValues.useImage);
  const [startDate, setStartDate] = useState(initialValues.startDate);
  const [endDate, setEndDate] = useState(initialValues.endDate);

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
          <Checkbox.Control><Checkbox.Indicator /></Checkbox.Control>
          인증할 때 이미지 파일 필수
        </Checkbox.Content>
      </Checkbox>

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
    </>
  );
}

export default function ChallengeForm({ challengeId, gatheringId, initialValues, mode }) {
  const action = mode === "create" ? createChallengeAction : updateChallengeAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const idPrefix = mode === "create" ? "new-challenge" : `challenge-${challengeId}`;
  const fieldsKey = mode === "create" ? state.resetKey : challengeId;

  return (
    <Form className="flex w-full flex-col gap-4" action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {challengeId ? <input type="hidden" name="challengeId" value={challengeId} /> : null}

      <ChallengeFields
        key={fieldsKey}
        idPrefix={idPrefix}
        initialValues={initialValues}
      />

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending
          ? (mode === "create" ? "생성하는 중..." : "저장하는 중...")
          : (mode === "create" ? "챌린지 만들기" : "수정 저장")}
      </Button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
