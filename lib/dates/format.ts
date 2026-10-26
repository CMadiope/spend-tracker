import { toUtcDate } from "./calendar";
import { periodStart } from "./period";

const monthYear = new Intl.DateTimeFormat("en-ZA", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const dayMonth = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const weekdayDayMonth = new Intl.DateTimeFormat("en-ZA", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatPeriod(period: string): string {
  return monthYear.format(toUtcDate(periodStart(period)));
}

export function formatDayMonth(date: string): string {
  return dayMonth.format(toUtcDate(date));
}

export function formatWeekdayDayMonth(date: string): string {
  return weekdayDayMonth.format(toUtcDate(date));
}
