import Link from "next/link";

import styles from "@/components/MomoCalendar.module.css";
import { getCurrentMonth, normalizeMonth } from "@/lib/utils/calendar";

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];
const maximumVisibleEvents = 3;

function formatDateValue(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentDateValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getMonthValue(year, monthIndex) {
  const date = new Date(Date.UTC(year, monthIndex, 1));
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${date.getUTCFullYear()}-${month}`;
}

function buildCalendarWeeks(monthValue) {
  const [year, month] = monthValue.split("-").map(Number);
  const monthIndex = month - 1;
  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const leadingDayCount = firstDay.getUTCDay();
  const cellCount = Math.ceil((leadingDayCount + daysInMonth) / 7) * 7;
  const days = [];

  for (let index = 0; index < cellCount; index += 1) {
    const date = new Date(Date.UTC(year, monthIndex, index - leadingDayCount + 1));
    const dateValue = formatDateValue(date);

    days.push({
      dateValue,
      day: date.getUTCDate(),
      isCurrentMonth: dateValue.startsWith(monthValue),
    });
  }

  const weeks = [];
  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

function getDateLabel(dateValue) {
  const [year, month, day] = dateValue.split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
}

function getEventsForDate(events, dateValue) {
  return events.filter((event) => {
    const endDate = event.end || event.start;
    return event.start <= dateValue && endDate >= dateValue;
  });
}

function getMonthHref(path, month) {
  return `${path}?month=${encodeURIComponent(month)}`;
}

function getDateHref(path, date) {
  const month = date.slice(0, 7);
  return `${path}?month=${encodeURIComponent(month)}&date=${encodeURIComponent(date)}`;
}

function CalendarEvent({ event, showEventLink }) {
  const content = showEventLink && event.url ? (
    <Link href={event.url} title={event.title}>{event.title}</Link>
  ) : (
    <span title={event.title}>{event.title}</span>
  );

  return <li className={styles.event}>{content}</li>;
}

export default function MomoCalendar({
  ariaLabel,
  events,
  selectedMonth,
  monthNavigationPath,
  dateNavigationPath,
  selectedDate,
}) {
  const monthValue = normalizeMonth(selectedMonth);
  const [year, month] = monthValue.split("-").map(Number);
  const previousMonth = getMonthValue(year, month - 2);
  const nextMonth = getMonthValue(year, month);
  const currentMonth = getCurrentMonth();
  const currentDate = getCurrentDateValue();
  const weeks = buildCalendarWeeks(monthValue);
  const title = `${year}년 ${month}월`;

  return (
    <div role="region" aria-label={ariaLabel}>
      <div className={styles.toolbar}>
        <nav className={styles.navigation} aria-label={`${ariaLabel} 월 이동`}>
          <Link
            href={getMonthHref(monthNavigationPath, previousMonth)}
            scroll={false}
            aria-label={`${previousMonth}로 이동`}
          >
            ‹
          </Link>
          <Link
            href={getMonthHref(monthNavigationPath, nextMonth)}
            scroll={false}
            aria-label={`${nextMonth}로 이동`}
          >
            ›
          </Link>
          {monthValue !== currentMonth ? (
            <Link href={getMonthHref(monthNavigationPath, currentMonth)} scroll={false}>
              오늘
            </Link>
          ) : null}
        </nav>
        <h3 className={styles.title}>{title}</h3>
        <div aria-hidden="true" />
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.monthTable}>
          <caption className="visually-hidden">{title} {ariaLabel}</caption>
          <thead>
            <tr>
              {weekdayLabels.map((weekday) => <th key={weekday} scope="col">{weekday}</th>)}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week) => (
              <tr key={week[0].dateValue}>
                {week.map((day) => {
                  const dateEvents = getEventsForDate(events, day.dateValue);
                  const visibleEvents = dateEvents.slice(0, maximumVisibleEvents);
                  const hiddenEvents = dateEvents.slice(maximumVisibleEvents);
                  const dayClassName = [
                    styles.day,
                    day.isCurrentMonth ? "" : styles.outsideMonth,
                    day.dateValue === currentDate ? styles.today : "",
                  ].filter(Boolean).join(" ");

                  return (
                    <td className={dayClassName} key={day.dateValue}>
                      {dateNavigationPath ? (
                        <Link
                          className={styles.dateLink}
                          href={getDateHref(dateNavigationPath, day.dateValue)}
                          scroll={false}
                          aria-label={`${getDateLabel(day.dateValue)} 내역 보기`}
                          aria-current={selectedDate === day.dateValue ? "date" : undefined}
                        >
                          <time dateTime={day.dateValue}>{day.day}</time>
                        </Link>
                      ) : (
                        <time dateTime={day.dateValue} aria-label={getDateLabel(day.dateValue)}>
                          {day.day}
                        </time>
                      )}
                      {visibleEvents.length > 0 ? (
                        <ol className={styles.events}>
                          {visibleEvents.map((event) => (
                            <CalendarEvent
                              event={event}
                              key={event.id}
                              showEventLink={!dateNavigationPath}
                            />
                          ))}
                        </ol>
                      ) : null}
                      {hiddenEvents.length > 0 ? (
                        <small>+{hiddenEvents.length}개</small>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
