'use client';

import { Button, Form } from '@heroui/react';
import { useActionState } from 'react';

import HeroToast from '@/components/HeroToast';

const initialActionState = {
  error: '',
  message: '',
};

export default function ActionButtonForm({
  action,
  disabled = false,
  fields,
  label,
  pendingLabel,
  variant = 'primary',
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );

  return (
    <Form action={formAction}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        isDisabled={disabled || pending}
        isPending={pending}
        variant={variant}
      >
        {pending ? pendingLabel : label}
      </Button>
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
