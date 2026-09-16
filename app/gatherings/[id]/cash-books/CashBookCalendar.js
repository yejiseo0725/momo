import MomoCalendar from "@/components/MomoCalendar";

const amountFormatter = new Intl.NumberFormat("ko-KR");

export default function CashBookCalendar({ gatheringId, entries, selectedMonth, selectedDate }) {
  const events = entries.map((entry) => {
    const isSpending = entry.type === "SPENDING";

    return {
      id: entry.id,
      title: `${isSpending ? "-" : "+"}${amountFormatter.format(entry.amount)}`,
      start: entry.date,
    };
  });

  return (
    <MomoCalendar
      ariaLabel="가계부 달력"
      events={events}
      selectedMonth={selectedMonth}
      monthNavigationPath={`/gatherings/${gatheringId}/cash-books`}
      dateNavigationPath={`/gatherings/${gatheringId}/cash-books`}
      selectedDate={selectedDate}
    />
  );
}
