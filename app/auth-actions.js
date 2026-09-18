"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { redirectWithSuccess } from "@/lib/redirects";
import { requireSession } from "@/lib/session";
import {
  UserImageError,
  deleteUserImage,
  storeUserImage,
} from "@/lib/user-images";
import {
  GENDERS,
  ValidationError,
  isSafeInternalPath,
  readCategories,
  readEmail,
  readEnum,
  readPassword,
  readRegionCode,
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
      nickname: readRequiredText(formData, "nickname", "닉네임", 10),
      region: readRegionCode(formData),
      category: readCategories(formData),
      notificationEnabled: true,
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

  redirectWithSuccess("/", "회원가입이 완료되었습니다.");
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

  redirectWithSuccess(nextPath, "로그인했습니다.");
}

export async function logoutAction() {
  await auth.api.signOut({
    headers: await headers(),
  });
  redirectWithSuccess("/", "로그아웃했습니다.");
}

export async function updateProfileAction(_previousState, formData) {
  const session = await requireSession();
  let profile;
  const imageFile = formData.get("image");

  try {
    profile = {
      name: readRequiredText(formData, "name", "이름", 50),
      gender: readEnum(formData, "gender", "성별", GENDERS),
      nickname: readRequiredText(formData, "nickname", "닉네임", 10),
      region: readRegionCode(formData),
      category: readCategories(formData),
      notificationEnabled: formData.get("notificationEnabled") === "on",
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  let newImageUrl = null;
  try {
    newImageUrl = await storeUserImage(imageFile, {
      userId: session.user.id,
    });
  } catch (error) {
    if (error instanceof UserImageError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  if (newImageUrl) {
    profile.image = newImageUrl;
  }

  try {
    await auth.api.updateUser({
      headers: await headers(),
      body: profile,
    });
  } catch (error) {
    if (newImageUrl) {
      await deleteUserImage(newImageUrl);
    }
    return {
      error: "프로필을 수정하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      message: "",
    };
  }

  if (newImageUrl && session.user.image) {
    await deleteUserImage(session.user.image);
  }

  revalidatePath("/", "layout");
  redirectWithSuccess("/profile", "프로필 정보를 수정했습니다.");
}
