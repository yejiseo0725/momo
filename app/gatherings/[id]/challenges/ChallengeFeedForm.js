"use client";

import {
  Button,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
  Typography,
} from "@heroui/react";
import { useActionState, useEffect, useRef, useState } from "react";

import { createChallengeFeedAction } from "@/app/gatherings/[id]/challenges/actions";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
  resetKey: 0,
};

function ChallengeFeedFields({
  challengeId,
  defaultDate,
  imageRequired,
  maximumDate,
  minimumDate,
}) {
  const [doneDate, setDoneDate] = useState(defaultDate);
  const [description, setDescription] = useState("");

  return (
    <>
      <TextField fullWidth isRequired name="doneDate" type="date">
        <Label>인증일</Label>
        <Input
          id={`done-${challengeId}`}
          min={minimumDate}
          max={maximumDate}
          value={doneDate}
          onChange={(event) => setDoneDate(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="description">
        <Label>인증 내용</Label>
        <TextArea
          id={`feed-${challengeId}`}
          maxLength="500"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </TextField>

      {imageRequired ? (
        <div className="flex flex-col gap-2">
          <Label htmlFor={`image-${challengeId}`} isRequired>인증 이미지</Label>
          <input
            id={`image-${challengeId}`}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            aria-describedby={`image-${challengeId}-description`}
          />
          <Typography
            id={`image-${challengeId}-description`}
            color="muted"
            type="body-sm"
          >
            JPG, PNG, WebP 형식의 5MB 이하 이미지를 선택해 주세요.
          </Typography>
        </div>
      ) : null}
    </>
  );
}

export default function ChallengeFeedForm({
  challengeId,
  defaultDate,
  gatheringId,
  imageRequired,
  maximumDate,
  minimumDate,
}) {
  const [state, formAction, pending] = useActionState(
    createChallengeFeedAction,
    initialActionState,
  );
  const formRef = useRef(null);

  useEffect(() => {
    if (state.resetKey === initialActionState.resetKey) {
      return;
    }

    const disclosureElement = formRef.current?.closest('[data-slot="disclosure"]');
    const disclosureTrigger = disclosureElement?.querySelector(
      '[data-slot="disclosure-trigger"]',
    );

    if (disclosureTrigger?.getAttribute("aria-expanded") === "true") {
      disclosureTrigger.click();
    }
  }, [state.resetKey]);

  return (
    <Form ref={formRef} className="flex w-full flex-col gap-4" action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      <input type="hidden" name="challengeId" value={challengeId} />

      <ChallengeFeedFields
        key={state.resetKey}
        challengeId={challengeId}
        defaultDate={defaultDate}
        imageRequired={imageRequired}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
      />

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending ? "등록하는 중..." : "인증 남기기"}
      </Button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
