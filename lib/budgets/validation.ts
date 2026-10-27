import { z } from "zod";
import type { ExpenseCategory, MonthlyBudget } from "@/interfaces/domain";
import { expenseCategories } from "@/lib/data/schemas";
import { sumCents } from "@/lib/money/cents";
import { parseRandsToCents } from "@/lib/money/parse";

const AMOUNT_ERROR = "Enter an amount like 1 500,00";

const amount = z.string().transform((value, ctx) => {
  const cents = parseRandsToCents(value);
  if (cents === null) {
    ctx.addIssue({ code: "custom", message: AMOUNT_ERROR });
    return z.NEVER;
  }
  return cents;
});

const optionalAmount = z.string().transform((value, ctx) => {
  if (value.trim() === "") return undefined;
  const cents = parseRandsToCents(value);
  if (cents === null) {
    ctx.addIssue({ code: "custom", message: AMOUNT_ERROR });
    return z.NEVER;
  }
  return cents;
});

const budgetFormSchema = z.object({
  total: amount,
  ...Object.fromEntries(expenseCategories.map((c) => [c, optionalAmount])),
}) as z.ZodType<
  { total: number } & Partial<Record<ExpenseCategory, number | undefined>>,
  Record<string, string>
>;

export type BudgetFormValues = Record<"total" | ExpenseCategory, string>;

export type BudgetFormResult =
  | { success: true; budget: MonthlyBudget }
  | { success: false; errors: Partial<Record<keyof BudgetFormValues, string>> };

export function parseBudgetForm(
  period: string,
  values: BudgetFormValues,
): BudgetFormResult {
  const result = budgetFormSchema.safeParse(values);
  if (!result.success) {
    const errors: Partial<Record<keyof BudgetFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof BudgetFormValues;
      errors[field] ??= issue.message;
    }
    return { success: false, errors };
  }

  const { total, ...rest } = result.data;
  const categories: MonthlyBudget["categories"] = {};
  for (const category of expenseCategories) {
    const cents = rest[category];
    if (cents !== undefined) categories[category] = cents;
  }
  return { success: true, budget: { period, totalCents: total, categories } };
}

export function allocatedCents(budget: MonthlyBudget): number {
  return sumCents(Object.values(budget.categories));
}

export function centsToInput(cents: number | undefined): string {
  if (cents === undefined) return "";
  return `${Math.floor(cents / 100)},${String(cents % 100).padStart(2, "0")}`;
}
