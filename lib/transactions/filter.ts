import { z } from "zod";
import type { Transaction } from "@/interfaces/domain";
import { expenseCategories, incomeCategories } from "@/lib/data/schemas";
import { transactionsInPeriod } from "@/lib/spending/spending";

export const transactionTypes = [
  "expense",
  "refund",
  "income",
  "transfer",
] as const;

const filterSchema = z.object({
  category: z.enum([...expenseCategories, ...incomeCategories]).optional(),
  type: z.enum(transactionTypes).optional(),
  q: z.string().trim().max(100).optional(),
});

export type TransactionFilters = z.infer<typeof filterSchema>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) || undefined;

export function parseTransactionFilters(
  params: Record<string, string | string[] | undefined>,
): TransactionFilters {
  const raw = {
    category: first(params.category),
    type: first(params.type),
    q: first(params.q),
  };
  const result = filterSchema.safeParse(raw);
  if (result.success) return result.data;
  return {
    category: filterSchema.shape.category.safeParse(raw.category).data,
    type: filterSchema.shape.type.safeParse(raw.type).data,
    q: filterSchema.shape.q.safeParse(raw.q).data,
  };
}

export function filterTransactions(
  transactions: readonly Transaction[],
  period: string,
  { category, type, q }: TransactionFilters,
): Transaction[] {
  const query = q?.toLowerCase();
  return transactionsInPeriod(transactions, period)
    .filter((t) => !type || t.type === type)
    .filter((t) => !category || ("category" in t && t.category === category))
    .filter((t) => {
      if (!query) return true;
      const merchant = "merchant" in t ? (t.merchant ?? "") : "";
      return `${t.description} ${merchant}`.toLowerCase().includes(query);
    })
    .sort((a, b) =>
      a.date === b.date
        ? b.id.localeCompare(a.id)
        : b.date.localeCompare(a.date),
    );
}
