import Link from "next/link";
import { connection } from "next/server";

import { createScheduleAction } from "@/app/gatherings/[id]/schedules/actions";
import ScheduleCalendar from "@/app/gatherings/[id]/schedules/ScheduleCalendar";
import Message from "@/components/Message";
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
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <details>
          <summary>새 일정 만들기</summary>
          <form action={createScheduleAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <label>제목<input name="title" maxLength="100" required /></label>
            <label>설명<textarea name="description" maxLength="1000" required /></label>
            <label>시작일<input name="startDate" type="date" required /></label>
            <label>종료일<input name="endDate" type="date" required /></label>
            <label>장소<input name="region" maxLength="150" required /></label>
            <button type="submit">일정 만들기</button>
          </form>
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
                <p>{schedule.startDate} – {schedule.endDate} · {schedule.region}</p>
                <p><small>작성자 {schedule.authorName}</small></p>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
