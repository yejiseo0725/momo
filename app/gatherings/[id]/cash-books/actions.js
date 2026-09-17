"use server";

import { revalidatePath } from "next/cache";

import {
  CashBookError,
  createCashBookEntry,
  deleteCashBookEntry,
  updateCashBookEntry,
} from "@/lib/cash-books";
import { requireSession } from "@/lib/session";
import {
  CASH_BOOK_TYPES,
  ValidationError,
  readDateOnly,
  readEnum,
  readInteger,
  readOptionalText,
  readRequiredText,
} from "@/lib/utils/validation";

function readIds(formData) {
  return {
    gatheringId: readRequiredText(formData, "gatheringId", "모임", 100),
    entryId: formData.has("entryId")
      ? readRequiredText(formData, "entryId", "가계부 내역", 100)
      : "",
  };
}

function readAmount(formData) {
  const amount = formData.get("amount");

  if (typeof amount !== "string" || !/^[0-9]+$/.test(amount)) {
    throw new ValidationError("금액은 숫자만 입력해 주세요.");
  }

  return readInteger(formData, "amount", "금액", 1, 1000000000000);
}

function readInput(formData) {
  return {
    type: readEnum(formData, "type", "타입", CASH_BOOK_TYPES),
    title: readRequiredText(formData, "title", "내역", 120),
    amount: readAmount(formData),
    date: readDateOnly(formData, "date", "날짜"),
    memo: readOptionalText(formData, "memo", 500),
  };
}

export async function createCashBookEntryAction(_previousState, formData) {
  const session = await requireSession();
  let gatheringId = "";
  let input;
  try {
    ({ gatheringId } = readIds(formData));
    input = readInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await createCashBookEntry(gatheringId, session.user.id, input);
  } catch (error) {
    return {
      error: error instanceof CashBookError ? error.message : "가계부 내역을 만들지 못했습니다.",
      message: "",
    };
  }
  revalidatePath(`/gatherings/${gatheringId}/cash-books`);
  return { error: "", message: "가계부 내역을 만들었습니다." };
}

export async function updateCashBookEntryAction(_previousState, formData) {
  const session = await requireSession();
  let ids = { gatheringId: "", entryId: "" };
  let input;
  try {
    ids = readIds(formData);
    input = readInput(formData);
  } catch (error) {
    if (error instanceof ValidationError) {
      return { error: error.message, message: "" };
    }
    throw error;
  }

  try {
    await updateCashBookEntry(ids.entryId, ids.gatheringId, session.user.id, input);
  } catch (error) {
    return {
      error: error instanceof CashBookError ? error.message : "가계부 내역을 수정하지 못했습니다.",
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/cash-books`);
  return { error: "", message: "가계부 내역을 수정했습니다." };
}

export async function deleteCashBookEntryAction(_previousState, formData) {
  const session = await requireSession();
  const ids = readIds(formData);
  try {
    await deleteCashBookEntry(ids.entryId, ids.gatheringId, session.user.id);
  } catch (error) {
    return {
      error: error instanceof CashBookError ? error.message : "가계부 내역을 삭제하지 못했습니다.",
      message: "",
    };
  }
  revalidatePath(`/gatherings/${ids.gatheringId}/cash-books`);
  return { error: "", message: "가계부 내역을 삭제했습니다." };
}
