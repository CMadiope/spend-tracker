import type {
  ExpenseCategory,
  MonthlyBudget,
  Transaction,
} from "@/interfaces/domain";
import { expenseCategories } from "@/lib/data/schemas";
import { netSpendByCategory } from "@/lib/spending/spending";

export interface CategoryAmount {
  category: ExpenseCategory;
  cents: number;
}

export interface BudgetGroups {
  budgetedCents: number;
  unbudgetedCents: number;
  budgeted: CategoryAmount[];
  unbudgeted: CategoryAmount[];
}

export function budgetGroups(
  budget: MonthlyBudget | undefined,
  transactions: readonly Transaction[],
  period: string,
): BudgetGroups {
  const spent = netSpendByCategory(transactions, period);
  const groups: BudgetGroups = {
    budgetedCents: 0,
    unbudgetedCents: 0,
    budgeted: [],
    unbudgeted: [],
  };

  for (const category of expenseCategories) {
    const cents = Math.max(spent[category] ?? 0, 0);
    if (cents === 0) continue;
    if ((budget?.categories[category] ?? 0) > 0) {
      groups.budgeted.push({ category, cents });
      groups.budgetedCents += cents;
    } else {
      groups.unbudgeted.push({ category, cents });
      groups.unbudgetedCents += cents;
    }
  }

  const largestFirst = (a: CategoryAmount, b: CategoryAmount) =>
    b.cents - a.cents;
  groups.budgeted.sort(largestFirst);
  groups.unbudgeted.sort(largestFirst);
  return groups;
}

export function averageSpend(
  transactions: readonly Transaction[],
  periods: readonly string[],
): Partial<Record<ExpenseCategory, number>> {
  if (periods.length === 0) return {};
  const totals: Partial<Record<ExpenseCategory, number>> = {};
  for (const period of periods) {
    const spent = netSpendByCategory(transactions, period);
    for (const category of expenseCategories) {
      totals[category] =
        (totals[category] ?? 0) + Math.max(spent[category] ?? 0, 0);
    }
  }

  const averages: Partial<Record<ExpenseCategory, number>> = {};
  for (const category of expenseCategories) {
    const rands = Math.round((totals[category] ?? 0) / periods.length / 100);
    if (rands > 0) averages[category] = rands * 100;
  }
  return averages;
}
