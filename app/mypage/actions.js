"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { CATEGORIES, GENDERS } from "@/lib/constants";
import { requireSession } from "@/lib/session";

export async function updateProfileAction(formData) {
  await requireSession();
  const name = String(formData.get("name") || "").trim();
  const gender = String(formData.get("gender") || "");
  const nickname = String(formData.get("nickname") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const category = [...new Set(formData.getAll("category").map(String))];

  if (!name || !nickname || !region || !GENDERS.includes(gender)) {
    throw new Error("프로필 필수 항목을 확인해 주세요.");
  }
  if (category.length === 0 || category.some((item) => !CATEGORIES.includes(item))) {
    throw new Error("관심 카테고리를 한 개 이상 선택해 주세요.");
  }

  await auth.api.updateUser({
    body: { name, gender, nickname, region, category },
    headers: await headers(),
  });
  revalidatePath("/mypage");
}
