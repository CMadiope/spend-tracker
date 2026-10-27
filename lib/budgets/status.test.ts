import { expect, test } from "vitest";
import type { Transaction } from "@/interfaces/domain";
import { budgetStatus, periodBudgetUsage } from "./status";

test("thresholds are exact to the cent", () => {
  expect(budgetStatus(10_000, 7_999)).toBe("on_track");
  expect(budgetStatus(10_000, 8_000)).toBe("approaching");
  expect(budgetStatus(10_000, 8_999)).toBe("approaching");
  expect(budgetStatus(10_000, 9_000)).toBe("near_limit");
  expect(budgetStatus(10_000, 9_999)).toBe("near_limit");
  expect(budgetStatus(10_000, 10_000)).toBe("reached");
  expect(budgetStatus(10_000, 10_001)).toBe("over");
});

test("handles missing and zero budgets", () => {
  expect(budgetStatus(undefined, 5_000)).toBe("not_configured");
  expect(budgetStatus(0, 0)).toBe("no_budget");
  expect(budgetStatus(0, 1)).toBe("unbudgeted");
});

test("categories are isolated and refunds floor spend at zero", () => {
  const transactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      category: "shopping",
      amountCents: 12_000,
      date: "2026-10-02",
      description: "Clothes",
    },
    {
      id: "2",
      type: "refund",
      category: "transport",
      amountCents: 5_000,
      date: "2026-10-03",
      description: "Trip refund",
    },
  ];
  const usage = periodBudgetUsage(
    {
      period: "2026-10",
      totalCents: 50_000,
      categories: { shopping: 10_000, transport: 10_000 },
    },
    transactions,
    "2026-10",
  );
  const shopping = usage.categories.find((c) => c.scope === "shopping")!;
  const transport = usage.categories.find((c) => c.scope === "transport")!;

  expect(shopping).toMatchObject({
    status: "over",
    overspendCents: 2_000,
    percentUsed: 120,
  });
  expect(transport).toMatchObject({
    status: "on_track",
    spentCents: 0,
    remainingCents: 10_000,
  });
  expect(usage.overall).toMatchObject({
    spentCents: 7_000,
    status: "on_track",
  });
});
