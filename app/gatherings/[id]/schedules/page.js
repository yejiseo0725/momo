import { Card, Disclosure, Typography } from "@heroui/react";
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
      <section className="flex flex-col gap-4">
        <Typography type="h1">일정</Typography>
        <p>모임 일정을 달력에서 확인하고 참여 여부를 남기세요.</p>
        <ToastMessage
          error={getSingleSearchParam(query.error)}
          message={getSingleSearchParam(query.message)}
        />

        <Disclosure>
          <Disclosure.Heading>
            <Disclosure.Trigger>
              새 일정 만들기
              <Disclosure.Indicator />
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
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
          </Disclosure.Content>
        </Disclosure>
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
                    <Link className="link" href={`/gatherings/${id}/schedules/${schedule.id}`}>
                      {schedule.title}
                    </Link>
                  </Card.Title>
                  <Card.Description>작성자 {schedule.authorName}</Card.Description>
                </Card.Header>
                <Card.Content>
                  <p>{schedule.startDate} – {schedule.endDate} · {schedule.location}</p>
                </Card.Content>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}
