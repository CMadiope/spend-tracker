import type { MonthlyBudget, ScheduledItem } from "@/interfaces/domain";
import type { StoredState } from "./storage";

export function resolveBudget(
  seedBudgets: readonly MonthlyBudget[],
  stored: StoredState,
  period: string,
): MonthlyBudget | undefined {
  return (
    stored.budgets.find((b) => b.period === period) ??
    seedBudgets.find((b) => b.period === period)
  );
}

export function resolveScheduledItems(
  seedItems: readonly ScheduledItem[],
  stored: StoredState,
): readonly ScheduledItem[] {
  return stored.scheduledItems ?? seedItems;
}
