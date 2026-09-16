const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/;

export function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function normalizeMonth(value) {
  return typeof value === "string" && monthPattern.test(value) ? value : getCurrentMonth();
}

export function buildMonthCalendar(monthValue, schedules) {
  const month = normalizeMonth(monthValue);
  const [year, monthNumber] = month.split("-").map(Number);
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1));
  const lastDay = new Date(Date.UTC(year, monthNumber, 0));
  const cells = [];

  for (let index = 0; index < firstDay.getUTCDay(); index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= lastDay.getUTCDate(); day += 1) {
    const date = `${month}-${String(day).padStart(2, "0")}`;
    cells.push({
      day,
      date,
      schedules: schedules.filter(
        (schedule) => schedule.startDate <= date && schedule.endDate >= date,
      ),
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const weeks = [];
  for (let index = 0; index < cells.length; index += 7) {
    weeks.push(cells.slice(index, index + 7));
  }

  return { month, weeks };
}
