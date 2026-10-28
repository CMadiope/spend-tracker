import type { BudgetUsage } from "@/lib/budgets/status";
import { formatCents } from "@/lib/money/format";
import { statusDisplay } from "./status-chip";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const strokeByTone = {
  positive: "stroke-positive",
  warning: "stroke-warning",
  danger: "stroke-danger",
  info: "stroke-info",
};

export function BudgetRing({ usage }: { usage: BudgetUsage }) {
  const percent = usage.percentUsed;
  const filled = percent === null ? 0 : Math.min(percent, 100);
  const { tone } = statusDisplay[usage.status];
  const label =
    percent === null
      ? "No overall budget set"
      : `${percent}% of budget used, ${
          usage.overspendCents
            ? `${formatCents(usage.overspendCents)} over`
            : `${formatCents(usage.remainingCents ?? 0)} left`
        }`;

  return (
    <div role="img" aria-label={label} className="relative size-36 shrink-0">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-chart-grid"
        />
        {filled > 0 && (
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            strokeWidth="8"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - filled / 100)}
            className={strokeByTone[tone]}
          />
        )}
      </svg>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        <span className="text-2xl font-semibold">
          {percent === null ? "—" : `${percent}%`}
        </span>
        <span className="text-xs text-muted">
          {percent === null
            ? "no budget"
            : usage.overspendCents
              ? `${formatCents(usage.overspendCents)} over`
              : `${formatCents(usage.remainingCents ?? 0)} left`}
        </span>
      </div>
    </div>
  );
}
