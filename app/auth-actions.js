"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";
import {
  GENDERS,
  ValidationError,
  isSafeInternalPath,
  readCategories,
  readEmail,
  readEnum,
  readPassword,
  readRequiredText,
} from "@/lib/utils/validation";

function redirectWithError(pathname, message) {
  redirect(`${pathname}?error=${encodeURIComponent(message)}`);
}

export async function signupAction(formData) {
  let userInput;

  try {
    userInput = {
      name: readRequiredText(formData, "name", "이름", 50),
      gender: readEnum(formData, "gender", "성별", GENDERS),
      email: readEmail(formData),
      password: readPassword(formData),
      nickname: readRequiredText(formData, "nickname", "닉네임", 30),
      region: readRequiredText(formData, "region", "지역", 100),
      category: readCategories(formData),
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      redirectWithError("/signup", error.message);
    }
    throw error;
  }

  try {
    await auth.api.signUpEmail({ body: userInput });
  } catch {
    redirectWithError("/signup", "회원가입에 실패했습니다. 이미 사용 중인 이메일인지 확인해 주세요.");
  }

  redirect("/");
}

export async function loginAction(formData) {
  let email;
  let password;
  const nextPathValue = formData.get("next");
  const nextPath = isSafeInternalPath(nextPathValue) ? nextPathValue : "/";

  try {
    email = readEmail(formData);
    password = readPassword(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      redirectWithError("/login", error.message);
    }
    throw error;
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });
  } catch {
    redirectWithError("/login", "이메일 또는 비밀번호를 확인해 주세요.");
  }

  redirect(nextPath);
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}

export async function updateProfileAction(formData) {
  await requireSession();
  let profile;

  try {
    profile = {
      name: readRequiredText(formData, "name", "이름", 50),
      gender: readEnum(formData, "gender", "성별", GENDERS),
      nickname: readRequiredText(formData, "nickname", "닉네임", 30),
      region: readRequiredText(formData, "region", "지역", 100),
      category: readCategories(formData),
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      redirectWithError("/profile", error.message);
    }
    throw error;
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: profile,
    });
  } catch {
    redirectWithError("/profile", "프로필을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }

  redirect(`/profile?message=${encodeURIComponent("프로필을 수정했습니다.")}`);
}
