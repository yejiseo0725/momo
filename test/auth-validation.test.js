import assert from "node:assert/strict";
import test from "node:test";
import { validateLogin, validateRegistration } from "../lib/validation/auth.js";

function registrationData(overrides = {}) {
  const data = new FormData();
  const fields = {
    name: "홍모모",
    gender: "여성",
    email: "MOMO@example.com",
    password: "password123",
    nickname: "모모",
    region: "서울 마포구",
    category: ["공부", "친목"],
    ...overrides,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (Array.isArray(value)) {
      value.forEach((item) => data.append(key, item));
    } else {
      data.set(key, value);
    }
  }

  return data;
}

test("회원가입 입력을 정규화한다", () => {
  const result = validateRegistration(registrationData());

  assert.equal(result.data.email, "momo@example.com");
  assert.deepEqual(result.data.category, ["공부", "친목"]);
});

test("허용되지 않은 카테고리를 거절한다", () => {
  const result = validateRegistration(registrationData({ category: ["여행"] }));

  assert.equal(result.error, "관심 카테고리를 한 개 이상 선택해 주세요.");
});

test("로그인 필수값을 확인한다", () => {
  const data = new FormData();
  data.set("email", "momo@example.com");

  assert.equal(validateLogin(data).error, "이메일과 비밀번호를 입력해 주세요.");
});
