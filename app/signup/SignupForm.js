"use client";

import { useActionState, useState } from "react";

import { signupAction } from "@/app/auth-actions";
import FormMessage from "@/components/FormMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function SignupForm({ categories }) {
  const [state, formAction, pending] = useActionState(signupAction, initialActionState);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [region, setRegion] = useState("");

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
      <label htmlFor="name">이름</label>
      <input
        id="name"
        name="name"
        type="text"
        maxLength="50"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />

      <fieldset>
        <legend>성별</legend>
        <label>
          <input
            type="radio"
            name="gender"
            value="남성"
            checked={gender === "남성"}
            onChange={(event) => setGender(event.target.value)}
            required
          /> 남성
        </label>
        <label>
          <input
            type="radio"
            name="gender"
            value="여성"
            checked={gender === "여성"}
            onChange={(event) => setGender(event.target.value)}
            required
          /> 여성
        </label>
      </fieldset>

      <label htmlFor="email">이메일</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <label htmlFor="password">비밀번호</label>
      <input
        id="password"
        name="password"
        type="password"
        minLength="8"
        maxLength="128"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />
      <small>8자 이상 입력해 주세요.</small>

      <label htmlFor="nickname">닉네임</label>
      <input
        id="nickname"
        name="nickname"
        type="text"
        maxLength="30"
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
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
        maxLength="100"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        required
      />

      <button type="submit" disabled={pending}>
        {pending ? "가입하는 중..." : "가입하기"}
      </button>
      <FormMessage error={state.error} message={state.message} />
    </form>
  );
}
