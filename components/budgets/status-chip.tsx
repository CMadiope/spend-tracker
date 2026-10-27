import type { BudgetStatus } from "@/lib/budgets/status";

type Tone = "positive" | "warning" | "danger" | "info";

export const statusDisplay: Record<
  BudgetStatus,
  { label: string; tone: Tone }
> = {
  on_track: { label: "On track", tone: "positive" },
  approaching: { label: "Approaching (80%)", tone: "warning" },
  near_limit: { label: "Near limit (90%)", tone: "warning" },
  reached: { label: "Reached (100%)", tone: "danger" },
  over: { label: "Over budget", tone: "danger" },
  not_configured: { label: "Not configured", tone: "info" },
  no_budget: { label: "No budget set", tone: "info" },
  unbudgeted: { label: "Unbudgeted spending", tone: "info" },
};

export const toneClasses: Record<Tone, { chip: string; bar: string }> = {
  positive: { chip: "bg-positive-surface text-positive", bar: "bg-positive" },
  warning: { chip: "bg-warning-surface text-warning", bar: "bg-warning" },
  danger: { chip: "bg-danger-surface text-danger", bar: "bg-danger" },
  info: { chip: "bg-info-surface text-info", bar: "bg-info" },
};

const iconPaths: Record<Tone, string> = {
  positive: "M3 8.5l3 3 7-7",
  warning: "M8 2l6.5 12h-13zM8 6.5v3.5M8 12v.5",
  danger: "M3 3l10 10M13 3L3 13",
  info: "M8 7v5M8 4v.5",
};

export function StatusChip({ status }: { status: BudgetStatus }) {
  const { label, tone } = statusDisplay[status];
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 px-2 py-0.5 text-xs font-medium ${toneClasses[tone].chip}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="size-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPaths[tone]} />
      </svg>
      {label}
    </span>
  );
}
