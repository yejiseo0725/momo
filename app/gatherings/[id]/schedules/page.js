import { Card, Typography } from '@heroui/react';

import ScheduleCalendar from '@/app/gatherings/[id]/schedules/ScheduleCalendar';
import ScheduleCreateModal from '@/app/gatherings/[id]/schedules/ScheduleCreateModal';
import ScheduleDetailModal from '@/app/gatherings/[id]/schedules/ScheduleDetailModal';
import HeroToast from '@/components/HeroToast';
import { getSchedules } from '@/lib/schedules';
import { requireSession } from '@/lib/session';
import { normalizeMonth } from '@/lib/utils/calendar';
import { getSingleSearchParam } from '@/lib/utils/validation';
import { connection } from 'next/server';

export default async function SchedulesPage({ params, searchParams }) {
  await connection();
  const session = await requireSession();
  const { id } = await params;
  const query = await searchParams;
  const selectedMonth = normalizeMonth(getSingleSearchParam(query.month));
  const schedules = await getSchedules(id, session.user.id);
  const selectedDate = getSingleSearchParam(query.date);
  const selectedDateSchedules = selectedDate.startsWith(`${selectedMonth}-`)
    ? schedules.filter(
        (schedule) =>
          schedule.startDate <= selectedDate &&
          schedule.endDate >= selectedDate,
      )
    : [];

  return (
    <>
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Typography type="h1">일정</Typography>
          <ScheduleCreateModal gatheringId={id} />
        </div>
        <p>모임 일정을 달력에서 확인하고 참여 여부를 남기세요.</p>
        <HeroToast
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />
      </section>

      <section>
        <h2 className="sr-only">일정 달력</h2>
        <ScheduleCalendar
          gatheringId={id}
          schedules={schedules}
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
        />
      </section>

      {selectedDateSchedules.length > 0 ? (
        <section className="flex flex-col gap-4">
          <Typography type="h2">{selectedDate} 일정</Typography>
          <div className="grid gap-4 md:grid-cols-2">
            {selectedDateSchedules.map((schedule) => (
              <Card key={schedule.id}>
                <Card.Header>
                  <Card.Title>
                    <ScheduleDetailModal
                      currentUserId={session.user.id}
                      gatheringId={id}
                      schedule={schedule}
                    />
                  </Card.Title>
                  <Card.Description>
                    작성자 {schedule.authorName}
                  </Card.Description>
                </Card.Header>
                <Card.Content>
                  <p>
                    {schedule.startDate} – {schedule.endDate} ·{' '}
                    {schedule.location}
                  </p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
