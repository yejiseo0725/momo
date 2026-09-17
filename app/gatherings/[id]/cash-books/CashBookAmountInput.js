"use client";

export default function CashBookAmountInput({ id, onChange, value }) {
  return (
    <input
      id={id}
      name="amount"
      type="text"
      inputMode="numeric"
      pattern="[0-9]+"
      maxLength={13}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))}
      required
    />
  );
}
