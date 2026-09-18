'use client';

import {
  createCashBookEntryAction,
  updateCashBookEntryAction,
} from '@/app/gatherings/[id]/cash-books/actions';
import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  Form,
  Input,
  Label,
  TextArea,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { useActionState, useEffect, useState } from 'react';

import CashBookAmountInput from '@/app/gatherings/[id]/cash-books/CashBookAmountInput';
import HeroToast from '@/components/HeroToast';

function toCalendarDate(value) {
  if (!value) {
    return null;
  }

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

function toDateString(value) {
  return value ? value.toString() : '';
}

const initialActionState = {
  error: '',
  message: '',
};

export default function CashBookEntryForm({
  actionButtons,
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

      <div className="flex flex-col gap-1.5">
        <Label>타입</Label>
        <ToggleButtonGroup
          className="w-full flex"
          disallowEmptySelection
          fullWidth
          selectedKeys={type ? new Set([type]) : new Set()}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const nextKey = Array.from(keys)[0];
            if (nextKey) {
              setType(nextKey);
            }
          }}
        >
          <ToggleButton
            className="flex-1 data-[selected=true]:bg-secondary data-[selected=true]:text-secondary-foreground data-[selected=true]:font-semibold"
            id="SPENDING"
          >
            지출
          </ToggleButton>
          <ToggleButtonGroup.Separator />
          <ToggleButton
            className="flex-1 data-[selected=true]:bg-tertiary data-[selected=true]:text-tertiary-foreground data-[selected=true]:font-semibold"
            id="INCOME"
          >
            수입
          </ToggleButton>
        </ToggleButtonGroup>
        <input type="hidden" name="type" value={type} />
      </div>

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

      <DatePicker
        fullWidth
        isRequired
        value={toCalendarDate(date)}
        onChange={(nextDate) => setDate(toDateString(nextDate))}
      >
        <Label>날짜</Label>
        <DatePicker.Trigger className="flex w-full items-center gap-2">
          <DateField.Group className="flex min-w-0 flex-1 items-center gap-2">
            <DateField.Input aria-label="날짜">
              {(segment) => <DateField.Segment segment={segment} />}
            </DateField.Input>
          </DateField.Group>
          <DatePicker.TriggerIndicator />
        </DatePicker.Trigger>
        <DatePicker.Popover>
          <Calendar>
            <Calendar.Header>
              <Calendar.NavButton slot="previous" />
              <Calendar.Heading />
              <Calendar.NavButton slot="next" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(d) => <Calendar.Cell date={d} />}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Popover>
        <input type="hidden" name="date" value={date} />
      </DatePicker>

      <TextField fullWidth name="memo">
        <Label>메모</Label>
        <TextArea
          id={`${idPrefix}-memo`}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          maxLength="500"
        />
      </TextField>

      {actionButtons ? (
        typeof actionButtons === 'function'
          ? actionButtons({ pending })
          : actionButtons
      ) : (
        <Button
          className="w-full"
          type="submit"
          isDisabled={pending}
          isPending={pending}
        >
          {pending
            ? mode === 'create'
              ? '저장하는 중...'
              : '수정하는 중...'
            : mode === 'create'
              ? '내역 저장'
              : '수정 완료'}
        </Button>
      )}
      <HeroToast error={state.error} message={state.message} trigger={state} />
    </Form>
  );
}
