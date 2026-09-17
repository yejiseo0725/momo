import Calendar from "@/components/Calendar";

const amountFormatter = new Intl.NumberFormat("ko-KR");

export default function CashBookCalendar({ gatheringId, entries, selectedMonth, selectedDate }) {
  const totalsByDate = new Map();

  for (const entry of entries) {
    const totals = totalsByDate.get(entry.date) || { income: 0, spending: 0 };

    if (entry.type === "SPENDING") {
      totals.spending += entry.amount;
    } else {
      totals.income += entry.amount;
    }

    totalsByDate.set(entry.date, totals);
  }

  const events = [];
  for (const [date, totals] of totalsByDate) {
    if (totals.spending > 0) {
      events.push({
        id: `${date}-spending`,
        title: `지출 -${amountFormatter.format(totals.spending)}원`,
        start: date,
        variant: "spending",
      });
    }

    if (totals.income > 0) {
      events.push({
        id: `${date}-income`,
        title: `수입 +${amountFormatter.format(totals.income)}원`,
        start: date,
        variant: "income",
      });
    }
  }

  return (
    <Calendar
      ariaLabel="가계부 달력"
      events={events}
      selectedMonth={selectedMonth}
      monthNavigationPath={`/gatherings/${gatheringId}/cash-books`}
      dateNavigationPath={`/gatherings/${gatheringId}/cash-books`}
      selectedDate={selectedDate}
    />
  );
}
