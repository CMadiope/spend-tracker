import { expect, test } from "vitest";
import type { Transaction } from "@/interfaces/domain";
import { categoryBreakdown, spendingTrend, summarisePeriod } from "./spending";

const transactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    category: "salary",
    amountCents: 2_000_000,
    date: "2026-10-23",
    description: "Salary",
  },
  {
    id: "2",
    type: "expense",
    category: "groceries",
    amountCents: 300_000,
    date: "2026-10-02",
    description: "Groceries",
  },
  {
    id: "3",
    type: "expense",
    category: "shopping",
    amountCents: 250_000,
    date: "2026-10-05",
    description: "Clothing",
  },
  {
    id: "4",
    type: "refund",
    category: "shopping",
    amountCents: 50_000,
    date: "2026-10-09",
    description: "Returned item",
  },
  {
    id: "5",
    type: "refund",
    category: "transport",
    amountCents: 10_000,
    date: "2026-10-10",
    description: "Trip refund",
  },
  {
    id: "6",
    type: "transfer",
    direction: "out",
    amountCents: 500_000,
    date: "2026-10-26",
    description: "Savings",
  },
  {
    id: "7",
    type: "expense",
    category: "groceries",
    amountCents: 999_999,
    date: "2026-09-30",
    description: "Last month",
  },
  {
    id: "8",
    type: "expense",
    category: "groceries",
    amountCents: 999_999,
    date: "2026-11-01",
    description: "Next month",
  },
];

test("totals reconcile, with refunds netted and transfers excluded", () => {
  expect(summarisePeriod(transactions, "2026-10")).toEqual({
    incomeCents: 2_000_000,
    netExpensesCents: 490_000,
    netCashFlowCents: 1_510_000,
    savingsRatePercent: 76,
  });
});

test("savings rate is null when there is no income", () => {
  expect(
    summarisePeriod(transactions, "2026-11").savingsRatePercent,
  ).toBeNull();
});

test("category breakdown is net, sorted, and drops categories at or below zero", () => {
  expect(categoryBreakdown(transactions, "2026-10")).toEqual([
    { category: "groceries", netCents: 300_000 },
    { category: "shopping", netCents: 200_000 },
  ]);
});

test("trend has one entry per requested month", () => {
  expect(
    spendingTrend(transactions, ["2026-09", "2026-10", "2026-12"]),
  ).toEqual([
    { period: "2026-09", netExpensesCents: 999_999 },
    { period: "2026-10", netExpensesCents: 490_000 },
    { period: "2026-12", netExpensesCents: 0 },
  ]);
});
