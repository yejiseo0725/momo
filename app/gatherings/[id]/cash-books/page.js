import { connection } from "next/server";

import {
  deleteCashBookEntryAction,
} from "@/app/gatherings/[id]/cash-books/actions";
import CashBookCalendar from "@/app/gatherings/[id]/cash-books/CashBookCalendar";
import CashBookEntryForm from "@/app/gatherings/[id]/cash-books/CashBookEntryForm";
import ActionButtonForm from "@/components/ActionButtonForm";
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
      <section>
        <h1>가계부</h1>
        <p>모임의 수입과 지출을 함께 기록합니다.</p>
        <details>
          <summary>새 가계부 내역</summary>
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
        </details>
      </section>

      <section>
        <h2 className="visually-hidden">가계부 달력</h2>
        <CashBookCalendar
          gatheringId={id}
          entries={entries}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
        />
        <p aria-label={`${selectedMonth} 가계부 합계`}>
          <small>
            수입 <strong>{wonFormatter.format(totals.income)}</strong>
            {" | "}
            지출 <strong>{wonFormatter.format(totals.spending)}</strong>
            {" | "}
            합계 <strong>{wonFormatter.format(totals.balance)}</strong>
          </small>
        </p>
      </section>

      {selectedDateEntries.length > 0 ? (
        <section>
          <h2>{selectedDate} 내역</h2>
          <div className="stack" role="region" aria-label="가계부 내역">
            {selectedDateEntries.map((entry) => (
              <article key={entry.id}>
                <h3>{entry.title}</h3>
                <p>
                  {entry.type === "INCOME" ? "수입" : "지출"}
                  {" · "}
                  <strong>{wonFormatter.format(entry.amount)}</strong>
                </p>
                {entry.memo ? <p>{entry.memo}</p> : null}
                <p><small>작성자 {entry.authorName}</small></p>

                {entry.userId === session.user.id ? (
                  <details>
                    <summary>수정</summary>
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
                    />
                  </details>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
