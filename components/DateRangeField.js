'use client';

import {
  DateField,
  DateRangePicker,
  Label,
  RangeCalendar,
} from '@heroui/react';

import { parseDate } from '@internationalized/date';
import { useState } from 'react';

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

export default function DateRangeField({
  endDate: initialEndDate,
  startDate: initialStartDate,
}) {
  const [range, setRange] = useState({
    start: toCalendarDate(initialStartDate),
    end: toCalendarDate(initialEndDate),
  });

  return (
    <DateRangePicker
      fullWidth
      isRequired
      value={range.start && range.end ? range : null}
      onChange={(nextRange) =>
        setRange(
          nextRange || {
            start: null,
            end: null,
          },
        )
      }
    >
      <Label>기간</Label>
      <DateRangePicker.Trigger className="flex w-full items-center gap-2">
        <DateField.Group className="flex min-w-0 flex-1 items-center gap-2">
          <DateField.Input slot="start" aria-label="시작일">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateRangePicker.RangeSeparator />
          <DateField.Input slot="end" aria-label="종료일">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
        </DateField.Group>
        <DateRangePicker.TriggerIndicator />
      </DateRangePicker.Trigger>
      <DateRangePicker.Popover>
        <RangeCalendar>
          <RangeCalendar.Header>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.Heading />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(day) => (
                <RangeCalendar.HeaderCell>{day}</RangeCalendar.HeaderCell>
              )}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>
              {(date) => <RangeCalendar.Cell date={date} />}
            </RangeCalendar.GridBody>
          </RangeCalendar.Grid>
        </RangeCalendar>
      </DateRangePicker.Popover>
      <input type="hidden" name="startDate" value={toDateString(range.start)} />
      <input type="hidden" name="endDate" value={toDateString(range.end)} />
    </DateRangePicker>
  );
}
