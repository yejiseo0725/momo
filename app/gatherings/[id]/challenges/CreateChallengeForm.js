"use client";

import { useActionState, useState } from "react";

import { createChallengeAction } from "@/app/gatherings/[id]/challenges/actions";

const initialState = {
  error: "",
};

export default function CreateChallengeForm({ gatheringId }) {
  const [state, formAction, pending] = useActionState(createChallengeAction, initialState);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useImage, setUseImage] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <form action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />

      <label htmlFor="challenge-title">제목</label>
      <input
        id="challenge-title"
        name="title"
        type="text"
        maxLength="100"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
      />

      <label htmlFor="challenge-description">설명</label>
      <textarea
        id="challenge-description"
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
        /> 인증할 때 이미지 링크 필수
      </label>

      <label htmlFor="challenge-start">시작일</label>
      <input
        id="challenge-start"
        name="startDate"
        type="date"
        value={startDate}
        onChange={(event) => setStartDate(event.target.value)}
        required
      />

      <label htmlFor="challenge-end">종료일</label>
      <input
        id="challenge-end"
        name="endDate"
        type="date"
        value={endDate}
        onChange={(event) => setEndDate(event.target.value)}
        required
      />

      <button type="submit" disabled={pending}>
        {pending ? "생성하는 중..." : "챌린지 만들기"}
      </button>
      {state.error ? <small className="form-error" role="alert">{state.error}</small> : null}
    </form>
  );
}
