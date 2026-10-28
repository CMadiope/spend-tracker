import { expect, test } from "vitest";
import type { Transaction } from "@/interfaces/domain";
import { averageSpend, budgetGroups } from "./insights";

const expense = (
  id: string,
  category: "groceries" | "housing" | "shopping",
  amountCents: number,
  date: string,
): Transaction => ({
  id,
  type: "expense",
  category,
  amountCents,
  date,
  description: id,
});

const transactions: Transaction[] = [
  expense("a", "groceries", 40_000, "2026-08-05"),
  expense("b", "groceries", 50_050, "2026-09-05"),
  expense("c", "housing", 900_000, "2026-09-01"),
  expense("d", "groceries", 30_000, "2026-10-05"),
  expense("e", "housing", 900_000, "2026-10-01"),
  {
    id: "r",
    type: "refund",
    category: "shopping",
    amountCents: 5_000,
    date: "2026-10-06",
    description: "Refund",
  },
];

test("splits spend into budgeted and unbudgeted categories", () => {
  const groups = budgetGroups(
    {
      period: "2026-10",
      totalCents: 2_000_000,
      categories: { groceries: 45_000, shopping: 10_000 },
    },
    transactions,
    "2026-10",
  );
  expect(groups).toEqual({
    budgetedCents: 30_000,
    unbudgetedCents: 900_000,
    budgeted: [{ category: "groceries", cents: 30_000 }],
    unbudgeted: [{ category: "housing", cents: 900_000 }],
  });
});

test("averages earlier months to the nearest rand and skips empty categories", () => {
  expect(averageSpend(transactions, ["2026-08", "2026-09"])).toEqual({
    groceries: 45_000,
    housing: 450_000,
  });
  expect(averageSpend(transactions, [])).toEqual({});
});
