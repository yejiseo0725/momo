import Link from "next/link";
import { connection } from "next/server";

import { createScheduleAction } from "@/app/gatherings/[id]/schedules/actions";
import EmptyState from "@/components/EmptyState";
import Message from "@/components/Message";
import { getSchedules } from "@/lib/schedules";
import { requireSession } from "@/lib/session";
import { buildMonthCalendar, normalizeMonth } from "@/lib/utils/calendar";
import { getSingleSearchParam } from "@/lib/utils/validation";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export default async function SchedulesPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const schedules = await getSchedules(id, session.user.id);
  const selectedMonth = normalizeMonth(getSingleSearchParam(query.month));
  const calendar = buildMonthCalendar(selectedMonth, schedules);

  return (
    <>
      <section>
        <h1>일정</h1>
        <p>모임 일정을 달력에서 확인하고 참여 여부를 남기세요.</p>
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <form method="get" className="compact-form">
          <label htmlFor="month">조회할 달</label>
          <input id="month" name="month" type="month" defaultValue={calendar.month} />
          <button type="submit">달력 보기</button>
        </form>

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
        <h2>{calendar.month} 달력</h2>
        <div role="region" aria-label={`${calendar.month} 일정 달력`} tabIndex="0">
          <table className="calendar">
            <thead>
              <tr>{weekdays.map((weekday) => <th key={weekday} scope="col">{weekday}</th>)}</tr>
            </thead>
            <tbody>
              {calendar.weeks.map((week, weekIndex) => (
                <tr key={`${calendar.month}-week-${weekIndex}`}>
                  {week.map((day, dayIndex) => (
                    <td key={`${weekIndex}-${dayIndex}`}>
                      {day ? (
                        <>
                          <strong>{day.day}</strong>
                          {day.schedules.length > 0 ? (
                            <ol>
                              {day.schedules.map((schedule) => (
                                <li key={schedule.id}>
                                  <Link href={`/gatherings/${id}/schedules/${schedule.id}`}>{schedule.title}</Link>
                                </li>
                              ))}
                            </ol>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>전체 일정</h2>
        {schedules.length === 0 ? <EmptyState>등록된 일정이 없습니다.</EmptyState> : (
          <div className="stack">
            {schedules.map((schedule) => (
              <article key={schedule.id}>
                <h3><Link href={`/gatherings/${id}/schedules/${schedule.id}`}>{schedule.title}</Link></h3>
                <p>{schedule.startDate} – {schedule.endDate} · {schedule.region}</p>
                <p><small>작성자 {schedule.authorName}</small></p>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
