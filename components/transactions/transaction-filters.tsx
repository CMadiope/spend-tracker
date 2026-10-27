import Link from "next/link";
import { expenseCategories, incomeCategories } from "@/lib/data/schemas";
import { categoryLabels } from "@/lib/data/categories";
import {
  type TransactionFilters as Filters,
  transactionTypes,
} from "@/lib/transactions/filter";

const typeLabels: Record<(typeof transactionTypes)[number], string> = {
  expense: "Expenses",
  refund: "Refunds",
  income: "Income",
  transfer: "Transfers",
};

const fieldClass =
  "w-full border border-border bg-background px-3 py-2 text-text";

export function TransactionFilters({
  period,
  filters,
}: {
  period: string;
  filters: Filters;
}) {
  return (
    <form
      action="/transactions"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]"
    >
      <input type="hidden" name="month" value={period} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Description or merchant"
          className={fieldClass}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Category</span>
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className={fieldClass}
        >
          <option value="">All categories</option>
          {[...expenseCategories, ...incomeCategories].map((category) => (
            <option key={category} value={category}>
              {categoryLabels[category]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-muted">Type</span>
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className={fieldClass}
        >
          <option value="">All types</option>
          {transactionTypes.map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end gap-3">
        <button
          type="submit"
          className="bg-accent px-4 py-2 font-medium text-accent-text"
        >
          Apply
        </button>
        <Link
          href={`/transactions?month=${period}`}
          className="text-link px-1 py-2 text-sm"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
