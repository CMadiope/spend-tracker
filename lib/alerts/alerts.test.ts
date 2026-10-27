import { expect, test } from "vitest";
import type { MonthlyBudget, Transaction } from "@/interfaces/domain";
import { deriveAlerts, visibleAlerts } from "./alerts";

const budget: MonthlyBudget = {
  period: "2026-10",
  totalCents: 1_000_000,
  categories: { groceries: 10_000, transport: 10_000 },
};

const spend = (
  id: string,
  amountCents: number,
  date = "2026-10-05",
): Transaction => ({
  id,
  type: "expense",
  category: "groceries",
  amountCents,
  date,
  description: "Groceries",
});

const refund: Transaction = {
  id: "r",
  type: "refund",
  category: "groceries",
  amountCents: 1_500,
  date: "2026-10-06",
  description: "Refund",
};

test("raises one alert per budget at its highest level, with stable keys", () => {
  const alerts = deriveAlerts(budget, [spend("a", 9_500)], "2026-10");
  expect(alerts.map((a) => a.key)).toEqual(["2026-10:category:groceries:90"]);
  expect(deriveAlerts(budget, [spend("a", 9_500)], "2026-10")).toEqual(alerts);
  expect(deriveAlerts(budget, [spend("a", 9_500)], "2026-11")).toEqual([]);
});

test("a refund drops the level and restores its read state without re-issuing", () => {
  const state = {
    readKeys: ["2026-10:category:groceries:90"],
    dismissedKeys: [],
    firstSeenAt: { "2026-10:category:groceries:90": "2026-10-05" },
  };
  const afterRefund = deriveAlerts(
    budget,
    [spend("a", 9_500), refund],
    "2026-10",
  );
  expect(afterRefund.map((a) => a.key)).toEqual([
    "2026-10:category:groceries:80",
  ]);

  const restored = visibleAlerts(
    deriveAlerts(
      budget,
      [spend("a", 9_500), refund, spend("b", 1_500)],
      "2026-10",
    ),
    state,
  );
  expect(restored).toMatchObject([
    { unread: false, firstSeenAt: "2026-10-05" },
  ]);
  expect(
    visibleAlerts(restored, { ...state, dismissedKeys: [restored[0].key] }),
  ).toEqual([]);
});
