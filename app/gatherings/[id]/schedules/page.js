import Link from "next/link";
import { connection } from "next/server";
import { deleteScheduleAction, saveScheduleAction } from "@/app/gatherings/actions";
import { requireGatheringMember } from "@/lib/gathering-access";
import { db } from "@/lib/mongodb";
import { requireSession } from "@/lib/session";

export default async function SchedulesPage({ params }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  await requireGatheringMember(id, session.user.id);
  const schedules = await db.collection("schedules").find({ gatheringId: id }).sort({ startDate: 1 }).toArray();

  return (
    <>
      <h1>일정</h1>
      <details><summary>새 일정 만들기</summary><ScheduleForm gatheringId={id} /></details>
      {schedules.length === 0 ? <p>등록된 일정이 없습니다.</p> : schedules.map((schedule) => {
        const scheduleId = schedule._id.toString();
        return (
          <article key={scheduleId}>
            <h2><Link href={`/gatherings/${id}/schedules/${scheduleId}`}>{schedule.title}</Link></h2>
            <p>{schedule.startDate}{schedule.endDate !== schedule.startDate ? `부터 ${schedule.endDate}까지` : ""} · {schedule.region}</p>
            <p>{schedule.description}</p>
            {schedule.userId === session.user.id ? (
              <details>
                <summary>수정 또는 삭제</summary>
                <ScheduleForm gatheringId={id} schedule={schedule} />
                <form action={deleteScheduleAction}>
                  <input type="hidden" name="gatheringId" value={id} />
                  <input type="hidden" name="scheduleId" value={scheduleId} />
                  <button type="submit">삭제</button>
                </form>
              </details>
            ) : null}
          </article>
        );
      })}
    </>
  );
}

function ScheduleForm({ gatheringId, schedule }) {
  return (
    <form action={saveScheduleAction}>
      <input type="hidden" name="gatheringId" value={gatheringId} />
      {schedule ? <input type="hidden" name="scheduleId" value={schedule._id.toString()} /> : null}
      <label>제목 <input name="title" defaultValue={schedule?.title} required /></label>
      <label>설명 <textarea name="description" defaultValue={schedule?.description} required /></label>
      <label>시작일 <input name="startDate" type="date" defaultValue={schedule?.startDate} required /></label>
      <label>종료일 <input name="endDate" type="date" defaultValue={schedule?.endDate} required /></label>
      <label>장소 <input name="region" defaultValue={schedule?.region} required /></label>
      <button type="submit">{schedule ? "수정" : "생성"}</button>
    </form>
  );
}
