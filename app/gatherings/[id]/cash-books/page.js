import { Card, Chip, Disclosure, Typography } from "@heroui/react";
import { connection } from "next/server";

import {
  deleteCashBookEntryAction,
} from "@/app/gatherings/[id]/cash-books/actions";
import CashBookCalendar from "@/app/gatherings/[id]/cash-books/CashBookCalendar";
import CashBookEntryForm from "@/app/gatherings/[id]/cash-books/CashBookEntryForm";
import ActionButtonForm from "@/components/ActionButtonForm";
import ToastMessage from "@/components/ToastMessage";
import { getCashBookEntries } from "@/lib/cash-books";
import { requireSession } from "@/lib/session";
import { normalizeMonth } from "@/lib/utils/calendar";
import { getSingleSearchParam } from "@/lib/utils/validation";

const wonFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export default async function CashBooksPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const selectedMonth = normalizeMonth(getSingleSearchParam(query.month));
  const { entries, totals } = await getCashBookEntries(id, session.user.id, selectedMonth);
  const selectedDate = getSingleSearchParam(query.date);
  const selectedDateEntries = selectedDate.startsWith(`${selectedMonth}-`)
    ? entries.filter((entry) => entry.date === selectedDate)
    : [];

  return (
    <>
      <ToastMessage
        error={getSingleSearchParam(query.error)}
        message={getSingleSearchParam(query.message)}
      />
      <section className="flex flex-col gap-4">
        <Typography type="h1">가계부</Typography>
        <p>모임의 수입과 지출을 함께 기록합니다.</p>
        <Disclosure>
          <Disclosure.Heading>
            <Disclosure.Trigger>
              새 가계부 내역
              <Disclosure.Indicator />
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
            <CashBookEntryForm
              gatheringId={id}
              initialValues={{
                type: "SPENDING",
                title: "",
                amount: "",
                date: "",
                memo: "",
              }}
              mode="create"
            />
          </Disclosure.Content>
        </Disclosure>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="sr-only">가계부 달력</h2>
        <CashBookCalendar
          gatheringId={id}
          entries={entries}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
        />
        <div className="flex flex-wrap gap-2" aria-label={`${selectedMonth} 가계부 합계`}>
          <Chip color="success">수입 {wonFormatter.format(totals.income)}</Chip>
          <Chip color="danger">지출 {wonFormatter.format(totals.spending)}</Chip>
          <Chip>합계 {wonFormatter.format(totals.balance)}</Chip>
        </div>
      </section>

      {selectedDateEntries.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Typography type="h2">{selectedDate} 내역</Typography>
          <div className="grid gap-4 md:grid-cols-2" role="region" aria-label="가계부 내역">
            {selectedDateEntries.map((entry) => (
              <Card key={entry.id}>
                <Card.Header>
                  <Card.Title>{entry.title}</Card.Title>
                  <Card.Description>작성자 {entry.authorName}</Card.Description>
                </Card.Header>
                <Card.Content className="flex flex-col gap-3">
                  <Chip color={entry.type === "INCOME" ? "success" : "danger"}>
                    {entry.type === "INCOME" ? "수입" : "지출"} · {wonFormatter.format(entry.amount)}
                  </Chip>
                  {entry.memo ? <p>{entry.memo}</p> : null}

                  {entry.userId === session.user.id ? (
                    <Disclosure>
                      <Disclosure.Heading>
                        <Disclosure.Trigger>
                          수정
                          <Disclosure.Indicator />
                        </Disclosure.Trigger>
                      </Disclosure.Heading>
                      <Disclosure.Content>
                        <div className="flex flex-col gap-4">
                          <CashBookEntryForm
                            entryId={entry.id}
                            gatheringId={id}
                            initialValues={{
                              type: entry.type,
                              title: entry.title,
                              amount: entry.amount,
                              date: entry.date,
                              memo: entry.memo || "",
                            }}
                            mode="edit"
                          />
                          <ActionButtonForm
                            action={deleteCashBookEntryAction}
                            fields={{ gatheringId: id, entryId: entry.id }}
                            label="삭제"
                            pendingLabel="삭제하는 중..."
                            variant="danger"
                          />
                        </div>
                      </Disclosure.Content>
                    </Disclosure>
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
