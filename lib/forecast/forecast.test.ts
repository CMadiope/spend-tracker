import { expect, test } from "vitest";
import type { Account, ScheduledItem } from "@/interfaces/domain";
import { buildForecast, expandScheduledItems } from "./forecast";

const monthly = (
  id: string,
  day: number,
  amountCents: number,
  kind: ScheduledItem["kind"] = "debit_order",
): ScheduledItem => ({
  id,
  kind,
  description: id,
  amountCents,
  rule: {
    kind: "monthly",
    day,
    adjust: kind === "income" ? "previous_business_day" : "none",
  },
  startDate: "2026-01-01",
  active: true,
});

const account: Account = {
  name: "Cheque",
  maskedNumber: "•••• 1",
  openingBalanceCents: 100_000,
  openingDate: "2026-09-30",
};

test("expands schedules within the window, clamping and adjusting dates", () => {
  const events = expandScheduledItems(
    [
      monthly("salary", 25, 1_000_000, "income"),
      monthly("gym", 31, 50_000),
      monthly("rent", 20, 900_000),
      { ...monthly("old", 26, 1), endDate: "2026-10-01" },
      { ...monthly("paused", 26, 1), active: false },
    ],
    "2026-10-20",
    "2026-11-30",
  );
  expect(events.map((e) => e.id)).toEqual([
    "salary:2026-10-23",
    "gym:2026-10-31",
    "rent:2026-11-20",
    "salary:2026-11-25",
    "gym:2026-11-30",
  ]);
});

test("projects month-end, flags a negative day and ignores input order", () => {
  const items = [
    monthly("rent", 22, 300_000),
    monthly("salary", 23, 1_000_000, "income"),
    monthly("phone", 23, 20_000),
  ];
  const input = {
    account,
    transactions: [],
    today: "2026-10-20",
    period: "2026-10",
  };
  const forecast = buildForecast({ ...input, items });

  expect(forecast).toMatchObject({
    available: true,
    currentBalanceCents: 100_000,
    projectedBalanceCents: 780_000,
    firstNegativeDate: "2026-10-22",
  });
  if (!forecast.available) return;
  expect(forecast.timeline.map((r) => r.itemId)).toEqual([
    "rent",
    "salary",
    "phone",
  ]);
  expect(forecast.timeline.at(-1)?.balanceAfterCents).toBe(
    forecast.projectedBalanceCents,
  );
  expect(buildForecast({ ...input, items: [...items].reverse() })).toEqual(
    forecast,
  );
  expect(buildForecast({ ...input, items, period: "2026-09" })).toEqual({
    available: false,
  });
});
