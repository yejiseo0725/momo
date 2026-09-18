'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';
import ScheduleDetailModal from '@/app/gatherings/[id]/schedules/ScheduleDetailModal';

export default function ScheduleCalendar({
  currentUserId,
  gatheringId,
  schedules,
  selectedMonth,
  selectedDate,
}) {
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  const events = schedules.map((schedule) => ({
    id: schedule.id,
    title: schedule.title,
    start: schedule.startDate,
    end: schedule.endDate,
    schedule,
  }));

  function handleEventClick(event) {
    if (event.schedule) {
      setSelectedSchedule(event.schedule);
    }
  }

  return (
    <>
      <Calendar
        ariaLabel="일정 달력"
        events={events}
        selectedMonth={selectedMonth}
        monthNavigationPath={`/gatherings/${gatheringId}/schedules`}
        dateNavigationPath={`/gatherings/${gatheringId}/schedules`}
        selectedDate={selectedDate}
        onEventClick={handleEventClick}
      />

      {selectedSchedule ? (
        <ScheduleDetailModal
          currentUserId={currentUserId}
          gatheringId={gatheringId}
          schedule={selectedSchedule}
          isOpen={true}
          onOpenChange={(open) => {
            if (!open) setSelectedSchedule(null);
          }}
        />
      ) : null}
    </>
  );
}
