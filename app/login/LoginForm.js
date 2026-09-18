'use client';

import { Button, Form, Input, Label, TextField } from '@heroui/react';
import { useActionState, useState } from 'react';

import { loginAction } from '@/app/auth-actions';
import HeroToast from '@/components/HeroToast';

const initialActionState = {
  error: '',
  message: '',
};

export default function LoginForm({ nextPath }) {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialActionState,
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Form className="flex w-full max-w-md flex-col gap-4" action={formAction}>
      <input type="hidden" name="next" value={nextPath} />

      <TextField fullWidth isRequired name="email" type="email">
        <Label>이메일</Label>
        <Input
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </TextField>

      <TextField fullWidth isRequired name="password" type="password">
        <Label>비밀번호</Label>
        <Input
          minLength="8"
          maxLength="128"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </TextField>

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending ? '로그인 중...' : '로그인'}
      </Button>
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
