import { connection } from "next/server";
import { deleteCashBookAction, saveCashBookAction } from "@/app/gatherings/actions";
import { requireGatheringMember } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function CashBookPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  await requireGatheringMember(id, session.user.id);
  const items = await db.collection("cashBooks").find({ gatheringId: id }).sort({ date: -1 }).toArray();
  const income = items.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const spending = items.filter((item) => item.type === "SPENDING").reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <h1>가계부</h1>
      <p>수입 {income.toLocaleString("ko-KR")}원 · 지출 {spending.toLocaleString("ko-KR")}원 · 잔액 {(income - spending).toLocaleString("ko-KR")}원</p>
      <details><summary>새 내역 등록</summary><CashBookForm gatheringId={id} /></details>
      {items.length === 0 ? <p>등록된 내역이 없습니다.</p> : (
        <table>
          <thead><tr><th>날짜</th><th>구분</th><th>내역</th><th>금액</th><th>메모/관리</th></tr></thead>
          <tbody>{items.map((item) => {
            const itemId = item._id.toString();
            return (
              <tr key={itemId}>
                <td>{item.date}</td><td>{item.type === "INCOME" ? "수입" : "지출"}</td><td>{item.title}</td><td>{item.amount.toLocaleString("ko-KR")}원</td>
                <td>{item.memo || "-"}{item.userId === session.user.id ? (
                  <details><summary>수정/삭제</summary><CashBookForm gatheringId={id} item={item} /><form action={deleteCashBookAction}><input type="hidden" name="gatheringId" value={id} /><input type="hidden" name="cashBookId" value={itemId} /><button type="submit">삭제</button></form></details>
                ) : null}</td>
              </tr>
            );
          })}</tbody>
        </table>
      )}
    </>
  );
}

function CashBookForm({ gatheringId, item }) {
  return (
    <form action={saveCashBookAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {item ? <input type="hidden" name="cashBookId" value={item._id.toString()} /> : null}
      <label>구분 <select name="type" defaultValue={item?.type || "SPENDING"}><option value="INCOME">수입</option><option value="SPENDING">지출</option></select></label>
      <label>내역 <input name="title" defaultValue={item?.title} required /></label>
      <label>금액 <input name="amount" type="number" min="1" defaultValue={item?.amount} required /></label>
      <label>날짜 <input name="date" type="date" defaultValue={item?.date} required /></label>
      <label>메모 <textarea name="memo" defaultValue={item?.memo || ""} /></label>
      <button type="submit">{item ? "수정" : "등록"}</button>
    </form>
  );
}
