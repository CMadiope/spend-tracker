import { describe, expect, test } from "vitest";
import { netSpendByCategory } from "@/lib/spending/spending";
import { createDemoData } from "./seed";
import { transactionSchema } from "./schemas";

describe.each(["2026-10-01", "2026-10-20", "2026-10-31", "2028-02-29"])(
  "demo data for %s",
  (today) => {
    const data = createDemoData(today);
    const period = today.slice(0, 7);

    test("has no transactions after today", () => {
      expect(data.transactions.every((t) => t.date <= today)).toBe(true);
    });

    test("puts the current month's budgets in every state", () => {
      const budget = data.budgets.find((b) => b.period === period)!;
      const net = netSpendByCategory(data.transactions, period);
      const percent = (category: keyof typeof budget.categories) =>
        ((net[category] ?? 0) * 100) / budget.categories[category]!;

      expect(percent("groceries")).toBe(60);
      expect(percent("transport")).toBe(85);
      expect(percent("entertainment")).toBe(95);
      expect(percent("shopping")).toBe(115);
      expect(budget.categories.health).toBeUndefined();
    });
  },
);

test("is deterministic", () => {
  expect(createDemoData("2026-10-20")).toEqual(createDemoData("2026-10-20"));
});

test("rejects negative amounts and impossible dates", () => {
  const base = {
    id: "t1",
    type: "expense",
    category: "groceries",
    description: "Groceries",
  };
  expect(
    transactionSchema.safeParse({
      ...base,
      amountCents: -100,
      date: "2026-10-20",
    }).success,
  ).toBe(false);
  expect(
    transactionSchema.safeParse({
      ...base,
      amountCents: 100,
      date: "2026-02-30",
    }).success,
  ).toBe(false);
});
