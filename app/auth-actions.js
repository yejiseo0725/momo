"use server";

import { revalidatePath } from "next/cache";
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

export async function signupAction(_previousState, formData) {
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
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await auth.api.signUpEmail({ body: userInput });
  } catch {
    return {
      error: "회원가입에 실패했습니다. 이미 사용 중인 이메일인지 확인해 주세요.",
      message: "",
    };
  }

  redirect("/");
}

export async function loginAction(_previousState, formData) {
  let email;
  let password;
  const nextPathValue = formData.get("next");
  const nextPath = isSafeInternalPath(nextPathValue) ? nextPathValue : "/";

  try {
    email = readEmail(formData);
    password = readPassword(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
    });
  } catch {
    return { error: "이메일 또는 비밀번호를 확인해 주세요.", message: "" };
  }

  redirect(nextPath);
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirect("/");
}

export async function updateProfileAction(_previousState, formData) {
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
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: profile,
    });
  } catch {
    return {
      error: "프로필을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      message: "",
    };
  }

  revalidatePath("/profile");
  return { error: "", message: "프로필을 수정했습니다." };
}
