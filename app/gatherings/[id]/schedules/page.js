import Link from "next/link";
import { connection } from "next/server";

import ScheduleCalendar from "@/app/gatherings/[id]/schedules/ScheduleCalendar";
import ScheduleForm from "@/app/gatherings/[id]/schedules/ScheduleForm";
import ToastMessage from "@/components/ToastMessage";
import { getSchedules } from "@/lib/schedules";
import { requireSession } from "@/lib/session";
import { normalizeMonth } from "@/lib/utils/calendar";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function SchedulesPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const selectedMonth = normalizeMonth(getSingleSearchParam(query.month));
  const schedules = await getSchedules(id, session.user.id);
  const selectedDate = getSingleSearchParam(query.date);
  const selectedDateSchedules = selectedDate.startsWith(`${selectedMonth}-`)
    ? schedules.filter((schedule) => (
        schedule.startDate <= selectedDate && schedule.endDate >= selectedDate
      ))
    : [];

  return (
    <>
      <section>
        <h1>일정</h1>
        <p>모임 일정을 달력에서 확인하고 참여 여부를 남기세요.</p>
        <ToastMessage
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <details>
          <summary>새 일정 만들기</summary>
          <ScheduleForm
            gatheringId={id}
            initialValues={{
              title: "",
              description: "",
              startDate: "",
              endDate: "",
              location: "",
            }}
            mode="create"
          />
        </details>
      </section>

      <section>
        <h2 className="visually-hidden">일정 달력</h2>
        <ScheduleCalendar
          gatheringId={id}
          schedules={schedules}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
        />
      </section>

      {selectedDateSchedules.length > 0 ? (
        <section>
          <h2>{selectedDate} 일정</h2>
          <div className="stack">
            {selectedDateSchedules.map((schedule) => (
              <article key={schedule.id}>
                <h3><Link href={`/gatherings/${id}/schedules/${schedule.id}`}>{schedule.title}</Link></h3>
                <p>{schedule.startDate} – {schedule.endDate} · {schedule.location}</p>
                <p><small>작성자 {schedule.authorName}</small></p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
