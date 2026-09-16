import { connection } from "next/server";

import {
  createCashBookEntryAction,
  deleteCashBookEntryAction,
  updateCashBookEntryAction,
} from "@/app/gatherings/[id]/cash-books/actions";
import CashBookAmountInput from "@/app/gatherings/[id]/cash-books/CashBookAmountInput";
import CashBookCalendar from "@/app/gatherings/[id]/cash-books/CashBookCalendar";
import Message from "@/components/Message";
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
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <details>
          <summary>새 가계부 내역</summary>
          <form action={createCashBookEntryAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <label>타입
              <select name="type" defaultValue="SPENDING" required>
                <option value="INCOME">수입</option>
                <option value="SPENDING">지출</option>
              </select>
            </label>
            <label>내역<input name="title" maxLength="120" required /></label>
            <label>금액<CashBookAmountInput /></label>
            <label>날짜<input name="date" type="date" required /></label>
            <label>메모<textarea name="memo" maxLength="500" /></label>
            <button type="submit">내역 저장</button>
          </form>
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
                    <form action={updateCashBookEntryAction}>
                      <input type="hidden" name="gatheringId" value={id} />
                      <input type="hidden" name="entryId" value={entry.id} />
                      <label>타입
                        <select name="type" defaultValue={entry.type}>
                          <option value="INCOME">수입</option>
                          <option value="SPENDING">지출</option>
                        </select>
                      </label>
                      <label>내역<input name="title" defaultValue={entry.title} required /></label>
                      <label>금액<CashBookAmountInput defaultValue={entry.amount} /></label>
                      <label>날짜<input name="date" type="date" defaultValue={entry.date} required /></label>
                      <label>메모<textarea name="memo" defaultValue={entry.memo || ""} /></label>
                      <button type="submit">저장</button>
                    </form>
                    <form action={deleteCashBookEntryAction}>
                      <input type="hidden" name="gatheringId" value={id} />
                      <input type="hidden" name="entryId" value={entry.id} />
                      <button type="submit">삭제</button>
                    </form>
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
