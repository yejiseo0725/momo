import { Card, Chip, Surface, Typography } from '@heroui/react';

import CashBookCalendar from '@/app/gatherings/[id]/cash-books/CashBookCalendar';
import CashBookEntryModal from '@/app/gatherings/[id]/cash-books/CashBookEntryModal';
import HeroToast from '@/components/HeroToast';
import UserInfo from '@/components/UserInfo';
import { getCashBookEntries } from '@/lib/cash-books';
import { requireSession } from '@/lib/session';
import { normalizeMonth } from '@/lib/utils/calendar';
import { getSingleSearchParam } from '@/lib/utils/validation';
import { connection } from 'next/server';

const wonFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
});

export default async function CashBooksPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const selectedMonth = normalizeMonth(getSingleSearchParam(query.month));
  const { entries, totals } = await getCashBookEntries(
    id,
    session.user.id,
    selectedMonth,
  );
  const selectedDate = getSingleSearchParam(query.date);
  const selectedDateEntries = selectedDate.startsWith(`${selectedMonth}-`)
    ? entries.filter((entry) => entry.date === selectedDate)
    : [];

  return (
    <>
      <HeroToast
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <section className="flex flex-col gap-4 rounded-[28px] border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Typography type="h1">가계부</Typography>
            <p className="text-sm text-foreground/70">
              모임의 수입과 지출을 함께 기록합니다.
            </p>
          </div>
          <CashBookEntryModal
            gatheringId={id}
            initialValues={{
              type: 'SPENDING',
              title: '',
              amount: '',
              date: '',
              memo: '',
            }}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="sr-only">가계부 달력</h2>
        <CashBookCalendar
          gatheringId={id}
          entries={entries}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
        />
        <div
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          aria-label={`${selectedMonth} 가계부 합계`}
        >
          <Surface className="border-none bg-white/80 p-4 text-success shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <p className="text-sm font-medium">수입</p>
            <strong className="text-lg">
              {wonFormatter.format(totals.income)}
            </strong>
          </Surface>
          <Surface className="border-none bg-white/80 p-4 text-danger shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <p className="text-sm font-medium">지출</p>
            <strong className="text-lg">
              {wonFormatter.format(totals.spending)}
            </strong>
          </Surface>
          <Surface className="border-none bg-white/80 p-4 text-primary shadow-[0_12px_32px_-8px_rgba(0,0,0,0.06)] backdrop-blur-md">
            <p className="text-sm font-medium">합계</p>
            <strong className="text-lg">
              {wonFormatter.format(totals.balance)}
            </strong>
          </Surface>
        </div>
      </section>

      {selectedDateEntries.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Typography type="h2">{selectedDate} 내역</Typography>
          <div
            className="grid gap-4 md:grid-cols-2"
            role="region"
            aria-label="가계부 내역"
          >
            {selectedDateEntries.map((entry) => (
              <Card key={entry.id}>
                <Card.Header>
                  <Card.Title>{entry.title}</Card.Title>
                  <div className="pt-1">
                    <UserInfo label="작성자" name={entry.authorName} image={entry.authorImage} />
                  </div>
                </Card.Header>
                <Card.Content className="flex flex-col gap-3">
                  <Chip color={entry.type === 'INCOME' ? 'success' : 'danger'}>
                    {entry.type === 'INCOME' ? '수입' : '지출'} ·{' '}
                    {wonFormatter.format(entry.amount)}
                  </Chip>
                  {entry.memo ? <p>{entry.memo}</p> : null}

                  {entry.userId === session.user.id ? (
                    <CashBookEntryModal
                      entryId={entry.id}
                      gatheringId={id}
                      initialValues={{
                        type: entry.type,
                        title: entry.title,
                        amount: entry.amount,
                        date: entry.date,
                        memo: entry.memo || '',
                      }}
                      mode="edit"
                    />
                  ) : null}
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
