import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  deleteScheduleAction,
  joinScheduleAction,
  leaveScheduleAction,
  updateScheduleAction,
} from "@/app/gatherings/[id]/schedules/actions";
import Message from "@/components/Message";
import { getScheduleDetails } from "@/lib/schedules";
import { requireSession } from "@/lib/session";
import { getSingleSearchParam } from "@/lib/utils/validation";

export default async function ScheduleDetailsPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id, scheduleId } = await params;
  const query = await searchParams;
  const details = await getScheduleDetails(scheduleId, id, session.user.id);

  if (!details) {
    notFound();
  }

  const { schedule, participants, isParticipating } = details;
  const isAuthor = schedule.userId === session.user.id;

  return (
    <>
      <section>
        <p><Link href={`/gatherings/${id}/schedules`}>← 일정 달력</Link></p>
        <h1>{schedule.title}</h1>
        <p>{schedule.description}</p>
        <dl>
          <dt>기간</dt><dd>{schedule.startDate} – {schedule.endDate}</dd>
          <dt>장소</dt><dd>{schedule.region}</dd>
          <dt>작성자</dt><dd>{schedule.authorName}</dd>
        </dl>
        <Message
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        {!isParticipating ? (
          <form action={joinScheduleAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <input type="hidden" name="scheduleId" value={scheduleId} />
            <button type="submit">참여하기</button>
          </form>
        ) : !isAuthor ? (
          <form action={leaveScheduleAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <input type="hidden" name="scheduleId" value={scheduleId} />
            <button type="submit">참여 취소</button>
          </form>
        ) : (
          <p className="notice">일정 작성자는 참여자로 등록되어 있습니다.</p>
        )}
      </section>

      <section>
        <h2>참여 멤버 {participants.length}명</h2>
        <ul>{participants.map((participant) => <li key={participant.id}>{participant.displayName}</li>)}</ul>
      </section>

      {isAuthor ? (
        <section>
          <details>
            <summary>일정 수정</summary>
            <form action={updateScheduleAction}>
              <input type="hidden" name="gatheringId" value={id} />
              <input type="hidden" name="scheduleId" value={scheduleId} />
              <label>제목<input name="title" defaultValue={schedule.title} maxLength="100" required /></label>
              <label>설명<textarea name="description" defaultValue={schedule.description} maxLength="1000" required /></label>
              <label>시작일<input name="startDate" type="date" defaultValue={schedule.startDate} required /></label>
              <label>종료일<input name="endDate" type="date" defaultValue={schedule.endDate} required /></label>
              <label>장소<input name="region" defaultValue={schedule.region} maxLength="150" required /></label>
              <button type="submit">수정 저장</button>
            </form>
          </details>
          <form action={deleteScheduleAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <input type="hidden" name="scheduleId" value={scheduleId} />
            <button type="submit">일정 삭제</button>
          </form>
        </section>
      ) : null}
    </>
  );
}
