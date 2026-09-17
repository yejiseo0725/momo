"use client";

import { useActionState, useState } from "react";

import { createChallengeFeedAction } from "@/app/gatherings/[id]/challenges/actions";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
};

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
  const [doneDate, setDoneDate] = useState(defaultDate);
  const [description, setDescription] = useState("");

  return (
    <form action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      <input type="hidden" name="challengeId" value={challengeId} />

      <label htmlFor={`done-${challengeId}`}>인증일</label>
      <input
        id={`done-${challengeId}`}
        name="doneDate"
        type="date"
        min={minimumDate}
        max={maximumDate}
        value={doneDate}
        onChange={(event) => setDoneDate(event.target.value)}
        required
      />

      <label htmlFor={`feed-${challengeId}`}>인증 내용</label>
      <textarea
        id={`feed-${challengeId}`}
        name="description"
        maxLength="500"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />

      {imageRequired ? (
        <>
          <label htmlFor={`image-${challengeId}`}>인증 이미지 (필수)</label>
          <input
            id={`image-${challengeId}`}
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
          />
          <small>JPG, PNG, WebP 형식의 5MB 이하 이미지를 선택해 주세요.</small>
        </>
      ) : null}

      <button type="submit" disabled={pending}>
        {pending ? "등록하는 중..." : "인증 남기기"}
      </button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </form>
  );
}
