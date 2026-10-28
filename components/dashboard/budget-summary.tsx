"use client";

import Link from "next/link";
import { alertName } from "@/components/alerts/alert-list";
import { BudgetRing } from "@/components/budgets/budget-ring";
import { SpendSplit } from "@/components/budgets/spend-split";
import { StatusChip } from "@/components/budgets/status-chip";
import type { MonthlyBudget, Transaction } from "@/interfaces/domain";
import { deriveAlerts, visibleAlerts } from "@/lib/alerts/alerts";
import { budgetGroups } from "@/lib/budgets/insights";
import { periodBudgetUsage } from "@/lib/budgets/status";
import { resolveBudget } from "@/lib/store/merge";
import { useStoredState } from "@/lib/store/store";

interface BudgetSummaryProps {
  period: string;
  seedBudgets: MonthlyBudget[];
  transactions: Transaction[];
}

export function BudgetSummary({
  period,
  seedBudgets,
  transactions,
}: BudgetSummaryProps) {
  const stored = useStoredState();

  return (
    <section
      aria-labelledby="budget-summary-heading"
      className="flex flex-col gap-4 border border-border bg-surface p-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="budget-summary-heading" className="font-semibold">
          Track my spend
        </h2>
        <Link href={`/budgets?month=${period}`} className="text-link text-sm">
          Manage budgets
        </Link>
      </div>
      {stored ? (
        <BudgetSummaryBody
          period={period}
          budget={resolveBudget(seedBudgets, stored, period)}
          transactions={transactions}
          alertState={stored.alerts}
        />
      ) : (
        <div aria-hidden className="h-28" />
      )}
    </section>
  );
}

function BudgetSummaryBody({
  period,
  budget,
  transactions,
  alertState,
}: {
  period: string;
  budget: MonthlyBudget | undefined;
  transactions: Transaction[];
  alertState: Parameters<typeof visibleAlerts>[1];
}) {
  const { overall } = periodBudgetUsage(budget, transactions, period);
  const groups = budgetGroups(budget, transactions, period);
  const alerts = visibleAlerts(
    deriveAlerts(budget, transactions, period),
    alertState,
  );

  return (
    <>
      <div className="flex flex-col items-center gap-4 sm:flex-row">
        <BudgetRing usage={overall} />
        <div className="flex w-full flex-col gap-3">
          <div className="self-start">
            <StatusChip status={overall.status} />
          </div>
          <SpendSplit
            budgetCents={overall.budgetCents}
            budgetedCents={groups.budgetedCents}
            unbudgetedCents={groups.unbudgetedCents}
          />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm text-muted">Active alerts</h3>
        {alerts.length === 0 ? (
          <p className="text-sm">No active alerts.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {alerts.map((alert) => (
              <li
                key={alert.key}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <span>{alertName(alert)}</span>
                <StatusChip status={alert.usage.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
