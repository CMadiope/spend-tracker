import type { MonthlyBudget, Transaction } from "@/interfaces/domain";
import {
  type BudgetScope,
  type BudgetStatus,
  type BudgetUsage,
  periodBudgetUsage,
} from "@/lib/budgets/status";
import type { StoredState } from "@/lib/store/storage";

export type AlertLevel = "80" | "90" | "100" | "over";

const levelByStatus: Partial<Record<BudgetStatus, AlertLevel>> = {
  approaching: "80",
  near_limit: "90",
  reached: "100",
  over: "over",
};

export interface Alert {
  key: string;
  period: string;
  scope: BudgetScope;
  level: AlertLevel;
  usage: BudgetUsage;
}

export interface VisibleAlert extends Alert {
  unread: boolean;
  firstSeenAt: string | undefined;
}

export function alertKey(
  period: string,
  scope: BudgetScope,
  level: AlertLevel,
): string {
  const scopeKey = scope === "overall" ? "overall" : `category:${scope}`;
  return `${period}:${scopeKey}:${level}`;
}

export function deriveAlerts(
  budget: MonthlyBudget | undefined,
  transactions: readonly Transaction[],
  period: string,
): Alert[] {
  const { overall, categories } = periodBudgetUsage(
    budget,
    transactions,
    period,
  );
  return [overall, ...categories].flatMap((usage) => {
    const level = levelByStatus[usage.status];
    if (!level) return [];
    return [
      {
        key: alertKey(period, usage.scope, level),
        period,
        scope: usage.scope,
        level,
        usage,
      },
    ];
  });
}

export function visibleAlerts(
  alerts: readonly Alert[],
  state: StoredState["alerts"],
): VisibleAlert[] {
  return alerts
    .filter((alert) => !state.dismissedKeys.includes(alert.key))
    .map((alert) => ({
      ...alert,
      unread: !state.readKeys.includes(alert.key),
      firstSeenAt: state.firstSeenAt[alert.key],
    }));
}
