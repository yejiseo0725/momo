import { connection } from "next/server";

import {
  createCashBookEntryAction,
  deleteCashBookEntryAction,
  updateCashBookEntryAction,
} from "@/app/gatherings/[id]/cash-books/actions";
import EmptyState from "@/components/EmptyState";
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

  return (
    <>
      <section>
        <h1>가계부</h1>
        <p>모임의 수입과 지출을 함께 기록합니다.</p>
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <form method="get" className="compact-form">
          <label htmlFor="month">조회할 달</label>
          <input id="month" name="month" type="month" defaultValue={selectedMonth} />
          <button type="submit">조회</button>
        </form>

        <div className="card-grid">
          <article><h2>수입</h2><p>{wonFormatter.format(totals.income)}</p></article>
          <article><h2>지출</h2><p>{wonFormatter.format(totals.spending)}</p></article>
          <article><h2>합계</h2><p>{wonFormatter.format(totals.balance)}</p></article>
        </div>

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
            <label>금액<input name="amount" type="number" min="1" max="1000000000000" required /></label>
            <label>날짜<input name="date" type="date" required /></label>
            <label>메모<textarea name="memo" maxLength="500" /></label>
            <button type="submit">내역 저장</button>
          </form>
        </details>
      </section>

      <section>
        <h2>{selectedMonth} 내역</h2>
        {entries.length === 0 ? <EmptyState>이 달에 등록된 가계부 내역이 없습니다.</EmptyState> : (
          <div role="region" aria-label="가계부 내역" tabIndex="0">
            <table>
              <thead>
                <tr><th>날짜</th><th>타입</th><th>내역</th><th>금액</th><th>작성자</th><th>관리</th></tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.type === "INCOME" ? "수입" : "지출"}</td>
                    <td>{entry.title}{entry.memo ? <><br /><small>{entry.memo}</small></> : null}</td>
                    <td>{wonFormatter.format(entry.amount)}</td>
                    <td>{entry.authorName}</td>
                    <td>
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
                            <label>금액<input name="amount" type="number" min="1" defaultValue={entry.amount} required /></label>
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
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
