import { expect, test } from "vitest";
import { netSpendByCategory } from "@/lib/spending/spending";
import { createDemoData } from "./seed";

test.each(["2026-10-01", "2026-10-31"])(
  "demo data for %s has budgets in every state and nothing after today",
  (today) => {
    const data = createDemoData(today);
    const period = today.slice(0, 7);
    const budget = data.budgets.find((b) => b.period === period)!;
    const net = netSpendByCategory(data.transactions, period);
    const percent = (category: keyof typeof budget.categories) =>
      ((net[category] ?? 0) * 100) / budget.categories[category]!;

    expect(data.transactions.every((t) => t.date <= today)).toBe(true);
    expect(percent("groceries")).toBe(60);
    expect(percent("transport")).toBe(85);
    expect(percent("entertainment")).toBe(95);
    expect(percent("shopping")).toBe(115);
    expect(budget.categories.health).toBeUndefined();
  },
);
