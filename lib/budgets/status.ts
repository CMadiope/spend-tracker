import type {
  ExpenseCategory,
  MonthlyBudget,
  Transaction,
} from "@/interfaces/domain";
import { expenseCategories } from "@/lib/data/schemas";
import { percentOf } from "@/lib/money/cents";
import { netSpendByCategory, summarisePeriod } from "@/lib/spending/spending";

export type BudgetStatus =
  | "on_track"
  | "approaching"
  | "near_limit"
  | "reached"
  | "over"
  | "not_configured"
  | "no_budget"
  | "unbudgeted";

export type BudgetScope = "overall" | ExpenseCategory;

export interface BudgetUsage {
  scope: BudgetScope;
  budgetCents: number | null;
  spentCents: number;
  remainingCents: number | null;
  overspendCents: number | null;
  percentUsed: number | null;
  status: BudgetStatus;
}

export function budgetStatus(
  budgetCents: number | undefined,
  spentCents: number,
): BudgetStatus {
  if (budgetCents === undefined) return "not_configured";
  if (budgetCents === 0) return spentCents === 0 ? "no_budget" : "unbudgeted";
  if (spentCents * 100 < budgetCents * 80) return "on_track";
  if (spentCents * 100 < budgetCents * 90) return "approaching";
  if (spentCents < budgetCents) return "near_limit";
  if (spentCents === budgetCents) return "reached";
  return "over";
}

export function budgetUsage(
  scope: BudgetScope,
  budgetCents: number | undefined,
  netSpentCents: number,
): BudgetUsage {
  const spentCents = Math.max(netSpentCents, 0);
  const hasBudget = budgetCents !== undefined && budgetCents > 0;
  return {
    scope,
    budgetCents: budgetCents ?? null,
    spentCents,
    remainingCents: hasBudget ? Math.max(budgetCents - spentCents, 0) : null,
    overspendCents: hasBudget ? Math.max(spentCents - budgetCents, 0) : null,
    percentUsed: hasBudget ? percentOf(spentCents, budgetCents) : null,
    status: budgetStatus(budgetCents, spentCents),
  };
}

export function periodBudgetUsage(
  budget: MonthlyBudget | undefined,
  transactions: readonly Transaction[],
  period: string,
): { overall: BudgetUsage; categories: BudgetUsage[] } {
  const spent = netSpendByCategory(transactions, period);
  const categories = expenseCategories
    .filter(
      (category) =>
        budget?.categories[category] !== undefined ||
        (spent[category] ?? 0) > 0,
    )
    .map((category) =>
      budgetUsage(category, budget?.categories[category], spent[category] ?? 0),
    );

  return {
    overall: budgetUsage(
      "overall",
      budget?.totalCents,
      summarisePeriod(transactions, period).netExpensesCents,
    ),
    categories,
  };
}
