"use client";

import { useActionState, useState } from "react";

import { updateProfileAction } from "@/app/auth-actions";
import FormMessage from "@/components/FormMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function ProfileForm({ categories, email, genders, initialValues }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialActionState);
  const [name, setName] = useState(initialValues.name);
  const [gender, setGender] = useState(initialValues.gender);
  const [nickname, setNickname] = useState(initialValues.nickname);
  const [selectedCategories, setSelectedCategories] = useState(initialValues.categories);
  const [region, setRegion] = useState(initialValues.region);
  const [notificationEnabled, setNotificationEnabled] = useState(
    initialValues.notificationEnabled,
  );

  function updateCategory(event) {
    const { checked, value } = event.target;
    setSelectedCategories((currentCategories) => (
      checked
        ? [...currentCategories, value]
        : currentCategories.filter((category) => category !== value)
    ));
  }

  return (
    <form action={formAction}>
      <label htmlFor="email">이메일</label>
      <input id="email" type="email" value={email} disabled />

      <label htmlFor="name">이름</label>
      <input
        id="name"
        name="name"
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength="50"
        required
      />

      <fieldset>
        <legend>성별</legend>
        {genders.map((genderOption) => (
          <label key={genderOption}>
            <input
              type="radio"
              name="gender"
              value={genderOption}
              checked={gender === genderOption}
              onChange={(event) => setGender(event.target.value)}
              required
            /> {genderOption}
          </label>
        ))}
      </fieldset>

      <label htmlFor="nickname">닉네임</label>
      <input
        id="nickname"
        name="nickname"
        type="text"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        maxLength="30"
        required
      />

      <fieldset>
        <legend>관심 카테고리</legend>
        {categories.map((category) => (
          <label key={category}>
            <input
              type="checkbox"
              name="category"
              value={category}
              checked={selectedCategories.includes(category)}
              onChange={updateCategory}
            /> {category}
          </label>
        ))}
      </fieldset>

      <label htmlFor="region">지역</label>
      <input
        id="region"
        name="region"
        type="text"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        maxLength="100"
        required
      />

      <fieldset>
        <legend>알림 설정</legend>
        <label>
          <input
            type="checkbox"
            name="notificationEnabled"
            checked={notificationEnabled}
            onChange={(event) => setNotificationEnabled(event.target.checked)}
          /> 새 일정과 새 챌린지 알림 받기
        </label>
      </fieldset>

      <button type="submit" disabled={pending}>
        {pending ? "저장하는 중..." : "프로필 저장"}
      </button>
      <FormMessage error={state.error} message={state.message} />
    </form>
  );
}
