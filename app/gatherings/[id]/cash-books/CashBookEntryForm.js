'use client';

import {
  createCashBookEntryAction,
  updateCashBookEntryAction,
} from '@/app/gatherings/[id]/cash-books/actions';
import {
  Button,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from '@heroui/react';
import { useActionState, useEffect, useState } from 'react';

import CashBookAmountInput from '@/app/gatherings/[id]/cash-books/CashBookAmountInput';
import HeroToast from '@/components/HeroToast';

const initialActionState = {
  error: '',
  message: '',
};

export default function CashBookEntryForm({
  entryId,
  gatheringId,
  initialValues,
  mode,
  onSuccess,
}) {
  const action =
    mode === 'create' ? createCashBookEntryAction : updateCashBookEntryAction;
  const [state, formAction, pending] = useActionState(
    action,
    initialActionState,
  );
  const [type, setType] = useState(initialValues.type);
  const [title, setTitle] = useState(initialValues.title);
  const [amount, setAmount] = useState(String(initialValues.amount));
  const [date, setDate] = useState(initialValues.date);
  const [memo, setMemo] = useState(initialValues.memo);
  const idPrefix = mode === 'create' ? 'new-cash-book' : `cash-book-${entryId}`;

  useEffect(() => {
    if (state.message) {
      onSuccess?.();
    }
  }, [onSuccess, state.message]);

  return (
    <Form className="flex w-full flex-col gap-4" action={formAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {entryId ? <input type="hidden" name="entryId" value={entryId} /> : null}

      <Select
        fullWidth
        isRequired
        name="type"
        selectedKey={type}
        onSelectionChange={(key) => setType(String(key))}
      >
        <Label>타입</Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            <ListBox.Item id="INCOME" textValue="수입">
              수입
            </ListBox.Item>
            <ListBox.Item id="SPENDING" textValue="지출">
              지출
            </ListBox.Item>
          </ListBox>
        </Select.Popover>
      </Select>

      <TextField fullWidth isRequired name="title">
        <Label>내역</Label>
        <Input
          id={`${idPrefix}-title`}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength="120"
        />
      </TextField>

      <TextField fullWidth isRequired name="amount">
        <Label>금액</Label>
        <CashBookAmountInput
          id={`${idPrefix}-amount`}
          value={amount}
          onChange={setAmount}
        />
      </TextField>

      <TextField fullWidth isRequired name="date" type="date">
        <Label>날짜</Label>
        <Input
          id={`${idPrefix}-date`}
          value={date}
          onChange={(event) => setDate(event.target.value)}
        />
      </TextField>

      <TextField fullWidth name="memo">
        <Label>메모</Label>
        <TextArea
          id={`${idPrefix}-memo`}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          maxLength="500"
        />
      </TextField>

      <Button type="submit" isDisabled={pending} isPending={pending}>
        {pending
          ? mode === 'create'
            ? '저장하는 중...'
            : '수정하는 중...'
          : mode === 'create'
            ? '내역 저장'
            : '저장'}
      </Button>
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
