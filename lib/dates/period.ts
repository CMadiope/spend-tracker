import { daysInMonth, isIsoDate, toIsoDate } from "./calendar";

const PERIOD = /^(\d{4})-(\d{2})$/;

export function parsePeriod(
  value: string,
): { year: number; month: number } | null {
  const match = PERIOD.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

export function isPeriod(value: string): boolean {
  return parsePeriod(value) !== null;
}

function requirePeriod(value: string): { year: number; month: number } {
  const parts = parsePeriod(value);
  if (!parts) throw new RangeError(`Invalid period: ${value}`);
  return parts;
}

export function periodOf(date: string): string {
  if (!isIsoDate(date)) throw new RangeError(`Invalid ISO date: ${date}`);
  return date.slice(0, 7);
}

export function periodStart(period: string): string {
  const { year, month } = requirePeriod(period);
  return toIsoDate({ year, month, day: 1 });
}

export function periodEnd(period: string): string {
  const { year, month } = requirePeriod(period);
  return toIsoDate({ year, month, day: daysInMonth(year, month) });
}

export function shiftPeriod(period: string, months: number): string {
  const { year, month } = requirePeriod(period);
  const index = year * 12 + (month - 1) + months;
  const nextYear = Math.floor(index / 12);
  const nextMonth = index - nextYear * 12 + 1;
  return `${String(nextYear).padStart(4, "0")}-${String(nextMonth).padStart(2, "0")}`;
}

export function nextPeriod(period: string): string {
  return shiftPeriod(period, 1);
}

export function previousPeriod(period: string): string {
  return shiftPeriod(period, -1);
}

export function isInPeriod(date: string, period: string): boolean {
  return periodStart(period) <= date && date < periodStart(nextPeriod(period));
}

export function clampToPeriod(period: string, day: number): string {
  const { year, month } = requirePeriod(period);
  const clamped = Math.min(Math.max(day, 1), daysInMonth(year, month));
  return toIsoDate({ year, month, day: clamped });
}
