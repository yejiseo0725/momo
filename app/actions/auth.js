"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { validateLogin, validateRegistration } from "@/lib/validation/auth";

function redirectWithError(path, message) {
  const query = new URLSearchParams({ error: message });
  redirect(`${path}?${query.toString()}`);
}

export async function registerAction(formData) {
  const result = validateRegistration(formData);

  if (result.error) {
    redirectWithError("/register", result.error);
  }

  try {
    await auth.api.signUpEmail({ body: result.data });
  } catch {
    redirectWithError("/register", "이미 사용 중인 이메일이거나 가입할 수 없습니다.");
  }

  redirect("/");
}

export async function loginAction(formData) {
  const result = validateLogin(formData);

  if (result.error) {
    redirectWithError("/login", result.error);
  }

  try {
    await auth.api.signInEmail({ body: result.data });
  } catch {
    redirectWithError("/login", "이메일 또는 비밀번호를 확인해 주세요.");
  }

  redirect("/");
}

export async function logoutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
