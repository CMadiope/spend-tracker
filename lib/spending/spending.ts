import type { ExpenseCategory, Transaction } from "@/interfaces/domain";
import { isInPeriod } from "@/lib/dates/period";
import { percentOf } from "@/lib/money/cents";

export interface PeriodSummary {
  incomeCents: number;
  netExpensesCents: number;
  netCashFlowCents: number;
  savingsRatePercent: number | null;
}

export interface CategorySpend {
  category: ExpenseCategory;
  netCents: number;
}

export function transactionsInPeriod(
  transactions: readonly Transaction[],
  period: string,
): Transaction[] {
  return transactions.filter((t) => isInPeriod(t.date, period));
}

export function netSpendByCategory(
  transactions: readonly Transaction[],
  period: string,
): Partial<Record<ExpenseCategory, number>> {
  const totals: Partial<Record<ExpenseCategory, number>> = {};
  for (const t of transactionsInPeriod(transactions, period)) {
    if (t.type === "expense") {
      totals[t.category] = (totals[t.category] ?? 0) + t.amountCents;
    } else if (t.type === "refund") {
      totals[t.category] = (totals[t.category] ?? 0) - t.amountCents;
    }
  }
  return totals;
}

export function summarisePeriod(
  transactions: readonly Transaction[],
  period: string,
): PeriodSummary {
  let incomeCents = 0;
  let netExpensesCents = 0;
  for (const t of transactionsInPeriod(transactions, period)) {
    if (t.type === "income") incomeCents += t.amountCents;
    else if (t.type === "expense") netExpensesCents += t.amountCents;
    else if (t.type === "refund") netExpensesCents -= t.amountCents;
  }
  const netCashFlowCents = incomeCents - netExpensesCents;
  return {
    incomeCents,
    netExpensesCents,
    netCashFlowCents,
    savingsRatePercent: percentOf(netCashFlowCents, incomeCents),
  };
}

export function categoryBreakdown(
  transactions: readonly Transaction[],
  period: string,
): CategorySpend[] {
  return Object.entries(netSpendByCategory(transactions, period))
    .map(([category, netCents]) => ({
      category: category as ExpenseCategory,
      netCents,
    }))
    .filter(({ netCents }) => netCents > 0)
    .sort(
      (a, b) => b.netCents - a.netCents || a.category.localeCompare(b.category),
    );
}
