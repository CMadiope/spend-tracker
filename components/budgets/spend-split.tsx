import { formatCents } from "@/lib/money/format";

interface SpendSplitProps {
  budgetCents: number | null;
  budgetedCents: number;
  unbudgetedCents: number;
}

const width = (cents: number, scale: number) => `${(cents / scale) * 100}%`;

export function SpendSplit({
  budgetCents,
  budgetedCents,
  unbudgetedCents,
}: SpendSplitProps) {
  const moneyOut = budgetedCents + unbudgetedCents;
  const scale = Math.max(budgetCents ?? 0, moneyOut, 1);

  return (
    <div className="flex flex-col gap-4">
      {budgetCents !== null && budgetCents > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="flex justify-between gap-3 text-sm">
            <span className="text-muted">Total budget</span>
            <span className="tabular-nums">{formatCents(budgetCents)}</span>
          </p>
          <div aria-hidden className="h-2 bg-chart-grid">
            <div
              className="h-full bg-chart-bar-muted"
              style={{ width: width(budgetCents, scale) }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="flex justify-between gap-3 text-sm">
          <span className="text-muted">Money out</span>
          <span className="tabular-nums">{formatCents(moneyOut)}</span>
        </p>
        <div aria-hidden className="flex h-2 gap-0.5 bg-chart-grid">
          {budgetedCents > 0 && (
            <div
              className="h-full bg-chart-bar"
              style={{ width: width(budgetedCents, scale) }}
            />
          )}
          {unbudgetedCents > 0 && (
            <div
              className="h-full bg-warning"
              style={{ width: width(unbudgetedCents, scale) }}
            />
          )}
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 bg-chart-bar" />
            Budgeted {formatCents(budgetedCents)}
          </li>
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 bg-warning" />
            Unbudgeted {formatCents(unbudgetedCents)}
          </li>
        </ul>
      </div>
    </div>
  );
}
