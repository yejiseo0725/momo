"use client";

import { useActionState, useState } from "react";

import { loginAction } from "@/app/auth-actions";
import FormMessage from "@/components/FormMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function LoginForm({ nextPath }) {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={nextPath} />

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
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <button type="submit" disabled={pending}>
        {pending ? "로그인 중..." : "로그인"}
      </button>
      <FormMessage error={state.error} message={state.message} />
    </form>
  );
}
