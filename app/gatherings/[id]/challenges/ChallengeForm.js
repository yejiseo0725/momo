"use client";

import { useActionState, useState } from "react";

import {
  createChallengeAction,
  updateChallengeAction,
} from "@/app/gatherings/[id]/challenges/actions";
import FormMessage from "@/components/FormMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function ChallengeForm({ challengeId, gatheringId, initialValues, mode }) {
  const action = mode === "create" ? createChallengeAction : updateChallengeAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [title, setTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [useImage, setUseImage] = useState(initialValues.useImage);
  const [startDate, setStartDate] = useState(initialValues.startDate);
  const [endDate, setEndDate] = useState(initialValues.endDate);
  const idPrefix = mode === "create" ? "new-challenge" : `challenge-${challengeId}`;

  return (
    <form action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {challengeId ? <input type="hidden" name="challengeId" value={challengeId} /> : null}

      <label htmlFor={`${idPrefix}-title`}>제목</label>
      <input
        id={`${idPrefix}-title`}
        name="title"
        type="text"
        maxLength="100"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label htmlFor={`${idPrefix}-description`}>설명</label>
      <textarea
        id={`${idPrefix}-description`}
        name="description"
        maxLength="1000"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        required
      />

      <label>
        <input
          type="checkbox"
          name="useImage"
          checked={useImage}
          onChange={(event) => setUseImage(event.target.checked)}
        /> 인증할 때 이미지 파일 필수
      </label>

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

      <button type="submit" disabled={pending}>
        {pending
          ? (mode === "create" ? "생성하는 중..." : "저장하는 중...")
          : (mode === "create" ? "챌린지 만들기" : "수정 저장")}
      </button>
      <FormMessage error={state.error} message={state.message} />
    </form>
  );
}
