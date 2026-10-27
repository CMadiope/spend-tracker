import { periodOf } from "./period";

export const APP_TIME_ZONE = "Africa/Johannesburg";

const isoDateInZone = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: APP_TIME_ZONE,
});

export function today(now: Date = new Date()): string {
  return isoDateInZone.format(now);
}

export function currentPeriod(now: Date = new Date()): string {
  return periodOf(today(now));
}
