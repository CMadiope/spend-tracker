import type { BudgetUsage } from "@/lib/budgets/status";
import { categoryLabels } from "@/lib/data/categories";
import { formatCents } from "@/lib/money/format";
import { StatusChip, statusDisplay, toneClasses } from "./status-chip";

export function budgetCardId(scope: BudgetUsage["scope"]): string {
  return scope === "overall" ? "overall-budget" : `category-${scope}`;
}

export function BudgetCard({ usage }: { usage: BudgetUsage }) {
  const name =
    usage.scope === "overall" ? "Overall budget" : categoryLabels[usage.scope];
  const { tone } = statusDisplay[usage.status];
  const percent = usage.percentUsed;

  return (
    <article
      id={budgetCardId(usage.scope)}
      tabIndex={-1}
      className="flex scroll-mt-6 flex-col gap-3 border border-border bg-surface p-4 focus:outline-2 focus:outline-offset-2 focus:outline-focus"
    >
      <header className="flex items-start justify-between gap-3">
        <h3 className="font-semibold">{name}</h3>
        <StatusChip status={usage.status} />
      </header>

      {usage.budgetCents !== null &&
      usage.budgetCents > 0 &&
      percent !== null ? (
        <>
          <p className="text-sm text-muted">
            <span className="text-lg font-semibold text-text">
              {formatCents(usage.spentCents)}
            </span>{" "}
            spent of {formatCents(usage.budgetCents)}
          </p>
          <div
            role="progressbar"
            aria-label={`${name} used`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.min(percent, 100)}
            aria-valuetext={`${percent}% used`}
            className="h-2 bg-chart-grid"
          >
            <div
              className={`h-full ${toneClasses[tone].bar}`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
          <p className="flex justify-between gap-3 text-sm">
            <span className="text-muted">{percent}% used</span>
            {usage.overspendCents ? (
              <span className="text-danger">
                {formatCents(usage.overspendCents)} over
              </span>
            ) : (
              <span>{formatCents(usage.remainingCents ?? 0)} left</span>
            )}
          </p>
        </>
      ) : (
        <p className="text-sm text-muted">
          {formatCents(usage.spentCents)} spent with no budget set.
        </p>
      )}
    </article>
  );
}
