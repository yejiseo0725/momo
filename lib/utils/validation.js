import { normalizeRegionCode } from "@/lib/regions";

export const CATEGORIES = ["운동", "공부", "공연/예술", "친목", "가족"];
export const GENDERS = ["남성", "여성"];
export const GATHERING_ROLES = ["LEADER", "MEMBER"];
export const CASH_BOOK_TYPES = ["INCOME", "SPENDING"];

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export function readRequiredText(formData, fieldName, label, maximumLength = 500) {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ValidationError(`${label}을(를) 입력해 주세요.`);
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maximumLength) {
    throw new ValidationError(`${label}은(는) ${maximumLength}자 이하로 입력해 주세요.`);
  }

  return normalizedValue;
}

export function readOptionalText(formData, fieldName, maximumLength = 500) {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim();

  if (normalizedValue.length > maximumLength) {
    throw new ValidationError(`${fieldName}은(는) ${maximumLength}자 이하로 입력해 주세요.`);
  }

  return normalizedValue;
}

export function readEmail(formData) {
  const email = readRequiredText(formData, "email", "이메일", 320).toLowerCase();

  if (!emailPattern.test(email)) {
    throw new ValidationError("올바른 이메일 주소를 입력해 주세요.");
  }

  return email;
}

export function readPassword(formData) {
  const value = formData.get("password");

  if (typeof value !== "string" || value.length < 8 || value.length > 128) {
    throw new ValidationError("비밀번호는 8자 이상 128자 이하로 입력해 주세요.");
  }

  return value;
}

export function readEnum(formData, fieldName, label, allowedValues) {
  const value = formData.get(fieldName);

  if (typeof value !== "string" || !allowedValues.includes(value)) {
    throw new ValidationError(`${label}을(를) 올바르게 선택해 주세요.`);
  }

  return value;
}

export function readCategories(formData) {
  const categories = formData
    .getAll("category")
    .filter((category) => typeof category === "string" && CATEGORIES.includes(category));
  const uniqueCategories = [...new Set(categories)];

  if (uniqueCategories.length === 0) {
    throw new ValidationError("관심 카테고리를 한 개 이상 선택해 주세요.");
  }

  return uniqueCategories;
}

export function readRegionCode(formData) {
  const value = readRequiredText(formData, "region", "지역", 100);
  const regionCode = normalizeRegionCode(value);

  if (!regionCode) {
    throw new ValidationError(
      "지역은 자동완성 목록에서 읍면동을 선택하거나 온라인을 입력해 주세요.",
    );
  }

  return regionCode;
}

export function readInteger(formData, fieldName, label, minimum, maximum) {
  const rawValue = formData.get(fieldName);
  const value = typeof rawValue === "string" ? Number(rawValue) : Number.NaN;

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ValidationError(`${label}은(는) ${minimum} 이상 ${maximum} 이하의 정수로 입력해 주세요.`);
  }

  return value;
}

export function readDateOnly(formData, fieldName, label) {
  const value = readRequiredText(formData, fieldName, label, 10);
  const parsedDate = new Date(`${value}T00:00:00Z`);

  if (
    !dateOnlyPattern.test(value)
    || Number.isNaN(parsedDate.getTime())
    || parsedDate.toISOString().slice(0, 10) !== value
  ) {
    throw new ValidationError(`${label}을(를) 올바른 날짜로 입력해 주세요.`);
  }

  return value;
}

export function readOptionalUrl(formData, fieldName, label) {
  const value = readOptionalText(formData, fieldName, 1000);

  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    throw new ValidationError(`${label}은(는) http 또는 https 주소로 입력해 주세요.`);
  }

  return value;
}

export function validateDateRange(startDate, endDate) {
  if (endDate < startDate) {
    throw new ValidationError("종료일은 시작일보다 빠를 수 없습니다.");
  }
}

export function escapeRegularExpression(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function getSingleSearchParam(value) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

export function isSafeInternalPath(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}
