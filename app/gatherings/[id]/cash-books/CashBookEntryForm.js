"use client";

import { useActionState, useState } from "react";

import {
  createCashBookEntryAction,
  updateCashBookEntryAction,
} from "@/app/gatherings/[id]/cash-books/actions";
import CashBookAmountInput from "@/app/gatherings/[id]/cash-books/CashBookAmountInput";
import ToastMessage from "@/components/ToastMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function CashBookEntryForm({ entryId, gatheringId, initialValues, mode }) {
  const action = mode === "create" ? createCashBookEntryAction : updateCashBookEntryAction;
  const [state, formAction, pending] = useActionState(action, initialActionState);
  const [type, setType] = useState(initialValues.type);
  const [title, setTitle] = useState(initialValues.title);
  const [amount, setAmount] = useState(String(initialValues.amount));
  const [date, setDate] = useState(initialValues.date);
  const [memo, setMemo] = useState(initialValues.memo);
  const idPrefix = mode === "create" ? "new-cash-book" : `cash-book-${entryId}`;

  return (
    <form action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {entryId ? <input type="hidden" name="entryId" value={entryId} /> : null}

      <label htmlFor={`${idPrefix}-type`}>타입</label>
      <select
        id={`${idPrefix}-type`}
        name="type"
        value={type}
        onChange={(event) => setType(event.target.value)}
        required
      >
        <option value="INCOME">수입</option>
        <option value="SPENDING">지출</option>
      </select>

      <label htmlFor={`${idPrefix}-title`}>내역</label>
      <input
        id={`${idPrefix}-title`}
        name="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength="120"
        required
      />

      <label htmlFor={`${idPrefix}-amount`}>금액</label>
      <CashBookAmountInput
        id={`${idPrefix}-amount`}
        value={amount}
        onChange={setAmount}
      />

      <label htmlFor={`${idPrefix}-date`}>날짜</label>
      <input
        id={`${idPrefix}-date`}
        name="date"
        type="date"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        required
      />

      <label htmlFor={`${idPrefix}-memo`}>메모</label>
      <textarea
        id={`${idPrefix}-memo`}
        name="memo"
        value={memo}
        onChange={(event) => setMemo(event.target.value)}
        maxLength="500"
      />

      <button type="submit" disabled={pending}>
        {pending
          ? (mode === "create" ? "저장하는 중..." : "수정하는 중...")
          : (mode === "create" ? "내역 저장" : "저장")}
      </button>
      <ToastMessage error={state.error} message={state.message} trigger={state} />
    </form>
  );
}
