import { Button, Card, Disclosure, Typography } from '@heroui/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import {
  deleteScheduleAction,
  joinScheduleAction,
  leaveScheduleAction,
} from '@/app/gatherings/[id]/schedules/actions';
import ScheduleForm from '@/app/gatherings/[id]/schedules/ScheduleForm';
import ActionButtonForm from '@/components/ActionButtonForm';
import HeroToast from '@/components/HeroToast';
import UserInfo from '@/components/UserInfo';
import { getScheduleDetails } from '@/lib/schedules';
import { requireSession } from '@/lib/session';
import { getSingleSearchParam } from '@/lib/utils/validation';

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
      <section className="flex flex-col gap-4">
        <p>
          <Link className="link" href={`/gatherings/${id}/schedules`}>
            ← 일정 달력
          </Link>
        </p>
        <Typography type="h1">{schedule.title}</Typography>
        <p>{schedule.description}</p>
        <Card>
          <Card.Content>
            <dl className="grid gap-3 sm:grid-cols-[6rem_1fr]">
              <dt className="font-medium">기간</dt>
              <dd>
                {schedule.startDate} – {schedule.endDate}
              </dd>
              <dt className="font-medium">장소</dt>
              <dd>{schedule.location}</dd>
              <dt className="font-medium">작성자</dt>
              <dd>
                <UserInfo name={schedule.authorName} image={schedule.authorImage} />
              </dd>
            </dl>
          </Card.Content>
        </Card>
        <HeroToast
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
            variant="danger-soft"
          />
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        <Typography type="h2">참여 멤버 {participants.length}명</Typography>
        <ul className="flex flex-col gap-2">
          {participants.map((participant) => (
            <li key={participant.id}>
              <UserInfo name={participant.displayName} image={participant.image} />
            </li>
          ))}
        </ul>
      </section>

      {isAuthor ? (
        <section className="flex flex-col gap-4">
          <Disclosure>
            <Disclosure.Heading>
              <Disclosure.Trigger>
                일정 수정
                <Disclosure.Indicator />
              </Disclosure.Trigger>
            </Disclosure.Heading>
            <Disclosure.Content>
              <ScheduleForm
                gatheringId={id}
                initialValues={{
                  title: schedule.title,
                  description: schedule.description,
                  startDate: schedule.startDate,
                  endDate: schedule.endDate,
                  location: schedule.location,
                }}
                mode="edit"
                scheduleId={scheduleId}
              />
            </Disclosure.Content>
          </Disclosure>
          <form action={deleteScheduleAction}>
            <input type="hidden" name="gatheringId" value={id} />
            <input type="hidden" name="scheduleId" value={scheduleId} />
            <Button type="submit" variant="danger">
              일정 삭제
            </Button>
          </form>
        </section>
      ) : null}
    </>
  );
}
