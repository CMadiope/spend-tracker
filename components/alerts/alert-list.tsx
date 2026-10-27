import Link from "next/link";
import { budgetCardId } from "@/components/budgets/budget-card";
import { StatusChip } from "@/components/budgets/status-chip";
import type { VisibleAlert } from "@/lib/alerts/alerts";
import { today } from "@/lib/dates/clock";
import { formatDayMonth, formatPeriod } from "@/lib/dates/format";
import { categoryLabels } from "@/lib/data/categories";
import { formatCents } from "@/lib/money/format";

interface AlertListProps {
  alerts: VisibleAlert[];
  onRead: (key: string) => void;
  onDismiss: (key: string) => void;
  onNavigate?: () => void;
}

export function alertName(alert: VisibleAlert): string {
  return alert.scope === "overall"
    ? "Overall budget"
    : categoryLabels[alert.scope];
}

export function AlertList({
  alerts,
  onRead,
  onDismiss,
  onNavigate,
}: AlertListProps) {
  if (alerts.length === 0) {
    return <p className="py-6 text-center text-sm text-muted">No alerts.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {alerts.map((alert) => {
        const { usage } = alert;
        const name = alertName(alert);
        return (
          <li key={alert.key} className="flex flex-col gap-2 py-3">
            <div className="flex items-start justify-between gap-3">
              <Link
                href={`/budgets?month=${alert.period}#${budgetCardId(alert.scope)}`}
                onClick={onNavigate}
                className="font-medium hover:underline"
              >
                {alert.unread && (
                  <>
                    <span
                      aria-hidden
                      className="mr-2 inline-block size-2 bg-accent align-middle"
                    />
                    <span className="sr-only">Unread:</span>{" "}
                  </>
                )}
                {name}
              </Link>
              <StatusChip status={usage.status} />
            </div>
            <p className="text-sm text-muted">
              {formatCents(usage.spentCents)} of{" "}
              {formatCents(usage.budgetCents ?? 0)} · {usage.percentUsed}% used
              ·{" "}
              {usage.overspendCents
                ? `${formatCents(usage.overspendCents)} over`
                : `${formatCents(usage.remainingCents ?? 0)} left`}
            </p>
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span>
                {formatPeriod(alert.period)}
                {alert.firstSeenAt &&
                  ` · First seen ${formatDayMonth(today(new Date(alert.firstSeenAt)))}`}
              </span>
              <span className="flex gap-3">
                {alert.unread && (
                  <button
                    type="button"
                    onClick={() => onRead(alert.key)}
                    className="text-link"
                  >
                    Mark read<span className="sr-only">, {name}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onDismiss(alert.key)}
                  className="text-link"
                >
                  Dismiss<span className="sr-only">, {name}</span>
                </button>
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
