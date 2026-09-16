import { CATEGORIES, GENDERS } from "../constants.js";

export function validateRegistration(formData) {
  const name = String(formData.get("name") || "").trim();
  const gender = String(formData.get("gender") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nickname = String(formData.get("nickname") || "").trim();
  const region = String(formData.get("region") || "").trim();
  const category = [...new Set(formData.getAll("category").map(String))];

  if (!name || !email || !password || !nickname || !region) {
    return { error: "필수 항목을 모두 입력해 주세요." };
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "올바른 이메일 주소를 입력해 주세요." };
  }

  if (password.length < 8) {
    return { error: "비밀번호는 8자 이상이어야 합니다." };
  }

  if (!GENDERS.includes(gender)) {
    return { error: "성별을 선택해 주세요." };
  }

  if (category.length === 0 || category.some((item) => !CATEGORIES.includes(item))) {
    return { error: "관심 카테고리를 한 개 이상 선택해 주세요." };
  }

  return {
    data: { name, gender, email, password, nickname, region, category },
  };
}

export function validateLogin(formData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "이메일과 비밀번호를 입력해 주세요." };
  }

  return { data: { email, password } };
}
