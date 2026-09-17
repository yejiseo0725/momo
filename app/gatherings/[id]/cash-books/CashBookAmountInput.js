"use client";

import { Input } from "@heroui/react";

export default function CashBookAmountInput({ id, onChange, value }) {
  return (
    <Input
      id={id}
      inputMode="numeric"
      pattern="[0-9]+"
      maxLength={13}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^0-9]/g, ""))}
    />
  );
}
