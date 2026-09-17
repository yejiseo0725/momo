import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import {
  deleteScheduleAction,
  joinScheduleAction,
  leaveScheduleAction,
} from "@/app/gatherings/[id]/schedules/actions";
import ScheduleForm from "@/app/gatherings/[id]/schedules/ScheduleForm";
import ActionButtonForm from "@/components/ActionButtonForm";
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
          <ActionButtonForm
            action={joinScheduleAction}
            fields={{ gatheringId: id, scheduleId }}
            label="참여하기"
            pendingLabel="참여하는 중..."
          />
        ) : null}

        {isParticipating && !isAuthor ? (
          <ActionButtonForm
            action={leaveScheduleAction}
            fields={{ gatheringId: id, scheduleId }}
            label="참여 취소"
            pendingLabel="취소하는 중..."
          />
        ) : null}
      </section>

      <section>
        <h2>참여 멤버 {participants.length}명</h2>
        <ul>{participants.map((participant) => <li key={participant.id}>{participant.displayName}</li>)}</ul>
      </section>

      {isAuthor ? (
        <section>
          <details>
            <summary>일정 수정</summary>
            <ScheduleForm
              gatheringId={id}
              initialValues={{
                title: schedule.title,
                description: schedule.description,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                region: schedule.region,
              }}
              mode="edit"
              scheduleId={scheduleId}
            />
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
