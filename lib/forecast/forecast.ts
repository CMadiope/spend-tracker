import type { Account, ScheduledItem, Transaction } from "@/interfaces/domain";
import { previousBusinessDay } from "@/lib/dates/calendar";
import {
  clampToPeriod,
  nextPeriod,
  periodEnd,
  periodOf,
} from "@/lib/dates/period";

export interface ForecastEvent {
  id: string;
  itemId: string;
  date: string;
  description: string;
  kind: ScheduledItem["kind"];
  amountCents: number;
  signedCents: number;
}

export interface TimelineRow extends ForecastEvent {
  balanceAfterCents: number;
}

export type Forecast =
  | { available: false }
  | {
      available: true;
      currentBalanceCents: number;
      projectedBalanceCents: number;
      incomeCents: number;
      outflowCents: number;
      timeline: TimelineRow[];
      firstNegativeDate: string | null;
    };

function signedTransactionCents(t: Transaction): number {
  if (t.type === "income" || t.type === "refund") return t.amountCents;
  if (t.type === "transfer")
    return t.direction === "in" ? t.amountCents : -t.amountCents;
  return -t.amountCents;
}

export function currentBalance(
  account: Account,
  transactions: readonly Transaction[],
  today: string,
): number {
  return transactions
    .filter((t) => account.openingDate < t.date && t.date <= today)
    .reduce(
      (balance, t) => balance + signedTransactionCents(t),
      account.openingBalanceCents,
    );
}

function occurrenceDates(item: ScheduledItem, from: string, to: string) {
  const { rule } = item;
  if (rule.kind === "once") return [rule.date];

  const dates: string[] = [];
  const last = nextPeriod(periodOf(to));
  for (
    let period = periodOf(from);
    period <= last;
    period = nextPeriod(period)
  ) {
    const date = clampToPeriod(period, rule.day);
    dates.push(
      rule.adjust === "previous_business_day"
        ? previousBusinessDay(date)
        : date,
    );
  }
  return dates;
}

export function expandScheduledItems(
  items: readonly ScheduledItem[],
  after: string,
  through: string,
): ForecastEvent[] {
  return items
    .filter((item) => item.active)
    .flatMap((item) =>
      occurrenceDates(item, after, through)
        .filter(
          (date) =>
            after < date &&
            date <= through &&
            item.startDate <= date &&
            (!item.endDate || date <= item.endDate),
        )
        .map((date) => ({
          id: `${item.id}:${date}`,
          itemId: item.id,
          date,
          description: item.description,
          kind: item.kind,
          amountCents: item.amountCents,
          signedCents:
            item.kind === "income" ? item.amountCents : -item.amountCents,
        })),
    )
    .sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        Number(b.kind === "income") - Number(a.kind === "income") ||
        b.amountCents - a.amountCents ||
        a.id.localeCompare(b.id),
    );
}

export function buildForecast(input: {
  account: Account;
  transactions: readonly Transaction[];
  items: readonly ScheduledItem[];
  today: string;
  period: string;
}): Forecast {
  const { account, transactions, items, today, period } = input;
  if (period < periodOf(today)) return { available: false };

  const currentBalanceCents = currentBalance(account, transactions, today);
  let balance = currentBalanceCents;
  let firstNegativeDate: string | null = null;
  let incomeCents = 0;
  let outflowCents = 0;

  const timeline = expandScheduledItems(items, today, periodEnd(period)).map(
    (event) => {
      balance += event.signedCents;
      if (event.signedCents > 0) incomeCents += event.amountCents;
      else outflowCents += event.amountCents;
      if (balance < 0 && firstNegativeDate === null)
        firstNegativeDate = event.date;
      return { ...event, balanceAfterCents: balance };
    },
  );

  return {
    available: true,
    currentBalanceCents,
    projectedBalanceCents: balance,
    incomeCents,
    outflowCents,
    timeline,
    firstNegativeDate,
  };
}
