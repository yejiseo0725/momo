"use client";

import { useActionState, useState } from "react";

import {
  createGatheringAction,
  updateGatheringAction,
} from "@/app/gatherings/actions";
import RegionAutocomplete from "@/components/RegionAutocomplete";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function GatheringForm({
  categories,
  gatheringId,
  initialValues,
  minimumMemberCount = 1,
  mode,
}) {
  const action = mode === "create" ? createGatheringAction : updateGatheringAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [name, setName] = useState(initialValues.name);
  const [description, setDescription] = useState(initialValues.description);
  const [maxMemCount, setMaxMemCount] = useState(String(initialValues.maxMemCount));
  const [category, setCategory] = useState(initialValues.category);
  const [visibility, setVisibility] = useState(initialValues.visibility);

  return (
    <form action={formAction}>
      {gatheringId ? <input type="hidden" name="gatheringId" value={gatheringId} /> : null}

      <label htmlFor="name">모임명</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength="80"
        required
      />

      <RegionAutocomplete
        helpText="읍면동 또는 온라인을 입력하고 자동완성 목록에서 선택해 주세요."
        initialRegionCode={initialValues.region}
        initialRegionName={initialValues.regionName}
      />

      <label htmlFor="description">소개</label>
      <textarea
        id="description"
        name="description"
        rows="6"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        maxLength="1000"
        required
      />

      <label htmlFor="maxMemCount">최대 인원</label>
      <input
        id="maxMemCount"
        name="maxMemCount"
        type="number"
        min={minimumMemberCount}
        max="300"
        value={maxMemCount}
        onChange={(event) => setMaxMemCount(event.target.value)}
        required
      />

      <label htmlFor="category">카테고리</label>
      <select
        id="category"
        name="category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
        required
      >
        <option value="" disabled>선택해 주세요</option>
        {categories.map((categoryOption) => (
          <option key={categoryOption} value={categoryOption}>{categoryOption}</option>
        ))}
      </select>

      <fieldset>
        <legend>공개 여부</legend>
        <label>
          <input
            type="radio"
            name="visibility"
            value="public"
            checked={visibility === "public"}
            onChange={(event) => setVisibility(event.target.value)}
          /> 공개 모임
        </label>
        <label>
          <input
            type="radio"
            name="visibility"
            value="private"
            checked={visibility === "private"}
            onChange={(event) => setVisibility(event.target.value)}
          /> 비공개 모임
        </label>
      </fieldset>

      <button type="submit" disabled={pending}>
        {pending
          ? (mode === "create" ? "만드는 중..." : "저장하는 중...")
          : (mode === "create" ? "모임 만들기" : "수정 내용 저장")}
      </button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </form>
  );
}
