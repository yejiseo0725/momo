import MomoCalendar from "@/components/MomoCalendar";

export default function ScheduleCalendar({ gatheringId, schedules, selectedMonth, selectedDate }) {
  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule.title,
    start: schedule.startDate,
    end: schedule.endDate,
  }));

  return (
    <MomoCalendar
      ariaLabel="일정 달력"
      events={events}
      selectedMonth={selectedMonth}
      monthNavigationPath={`/gatherings/${gatheringId}/schedules`}
      dateNavigationPath={`/gatherings/${gatheringId}/schedules`}
      selectedDate={selectedDate}
    />
  );
}
