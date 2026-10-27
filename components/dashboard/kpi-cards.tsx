import type { ReactNode } from "react";
import { formatCents, formatSignedCents } from "@/lib/money/format";
import type { PeriodSummary } from "@/lib/spending/spending";

function KpiCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border border-border bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums">{children}</dd>
    </div>
  );
}

export function KpiCards({ summary }: { summary: PeriodSummary }) {
  const {
    incomeCents,
    netExpensesCents,
    netCashFlowCents,
    savingsRatePercent,
  } = summary;

  return (
    <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard label="Income">{formatCents(incomeCents)}</KpiCard>
      <KpiCard label="Net expenses">{formatCents(netExpensesCents)}</KpiCard>
      <KpiCard label="Net cash flow">
        <span className={netCashFlowCents < 0 ? "text-danger" : undefined}>
          {formatSignedCents(netCashFlowCents)}
        </span>
      </KpiCard>
      <KpiCard label="Savings rate">
        {savingsRatePercent === null ? (
          <>
            <span aria-hidden>—</span>
            <span className="sr-only">Not available, no income this month</span>
          </>
        ) : (
          `${savingsRatePercent}%`
        )}
      </KpiCard>
    </dl>
  );
}

export function KpiCardsSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-22 border border-border bg-surface" />
      ))}
    </div>
  );
}
