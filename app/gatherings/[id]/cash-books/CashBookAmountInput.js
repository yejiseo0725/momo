"use client";

function removeNonDigitCharacters(event) {
  const input = event.currentTarget;
  input.value = input.value.replace(/[^0-9]/g, "");
}

export default function CashBookAmountInput({ defaultValue }) {
  return (
    <input
      name="amount"
      type="text"
      inputMode="numeric"
      pattern="[0-9]+"
      maxLength={13}
      defaultValue={defaultValue}
      onInput={removeNonDigitCharacters}
      required
    />
  );
}
