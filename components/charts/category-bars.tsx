import { categoryLabels } from "@/lib/data/categories";
import { formatCents } from "@/lib/money/format";
import type { CategorySpend } from "@/lib/spending/spending";
import { ChartCard } from "./chart-card";

export function CategoryBars({ categories }: { categories: CategorySpend[] }) {
  const max = Math.max(...categories.map((c) => c.netCents), 1);

  return (
    <ChartCard
      title="Spending by category"
      subtitle="Net of refunds, largest first"
      table={{
        headers: ["Category", "Net spend"],
        rows: categories.map((c) => [
          categoryLabels[c.category],
          formatCents(c.netCents),
        ]),
      }}
    >
      {categories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">
          No spending this month.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {categories.map((c) => (
            <li key={c.category} className="flex flex-col gap-1">
              <div className="flex justify-between gap-4 text-sm">
                <span>{categoryLabels[c.category]}</span>
                <span className="text-muted tabular-nums">
                  {formatCents(c.netCents)}
                </span>
              </div>
              <div className="h-2 bg-chart-grid">
                <div
                  className="h-full bg-chart-bar"
                  style={{ width: `${(c.netCents / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}
