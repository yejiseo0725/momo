"use client";

import { useActionState } from "react";

import FormMessage from "@/components/FormMessage";

const initialActionState = {
  error: "",
  message: "",
};

export default function ActionButtonForm({
  action,
  disabled = false,
  fields,
  label,
  pendingLabel,
}) {
  const [state, formAction, pending] = useActionState(action, initialActionState);

  return (
    <form action={formAction}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" disabled={disabled || pending}>
        {pending ? pendingLabel : label}
      </button>
      <FormMessage error={state.error} message={state.message} />
    </form>
  );
}
