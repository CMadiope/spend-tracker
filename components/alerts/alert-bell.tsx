"use client";

import { useEffect, useRef } from "react";
import type { MonthlyBudget, Transaction } from "@/interfaces/domain";
import { deriveAlerts, visibleAlerts } from "@/lib/alerts/alerts";
import { resolveBudget } from "@/lib/store/merge";
import {
  dismissAlert,
  markAlertsRead,
  recordFirstSeen,
  useStoredState,
} from "@/lib/store/store";
import { statusDisplay } from "@/components/budgets/status-chip";
import { formatPeriod } from "@/lib/dates/format";
import { AlertList, alertName } from "./alert-list";

interface AlertBellProps {
  period: string;
  seedBudgets: MonthlyBudget[];
  transactions: Transaction[];
}

export function AlertBell({
  period,
  seedBudgets,
  transactions,
}: AlertBellProps) {
  const stored = useStoredState();
  const panelRef = useRef<HTMLDivElement>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const alerts = stored
    ? deriveAlerts(
        resolveBudget(seedBudgets, stored, period),
        transactions,
        period,
      )
    : [];
  const visible = stored ? visibleAlerts(alerts, stored.alerts) : [];
  const unread = visible.filter((alert) => alert.unread);
  const fresh = stored
    ? visible.filter((alert) => !(alert.key in stored.alerts.firstSeenAt))
    : [];
  const freshKeys = fresh.map((alert) => alert.key).join("|");
  const freshMessage =
    fresh.length === 1
      ? `New budget alert: ${alertName(fresh[0])}, ${statusDisplay[fresh[0].usage.status].label}`
      : fresh.length > 1
        ? `${fresh.length} new budget alerts`
        : "";

  useEffect(() => {
    if (!freshKeys) return;
    recordFirstSeen(freshKeys.split("|"), new Date().toISOString());
    if (liveRef.current) liveRef.current.textContent = freshMessage;
  }, [freshKeys, freshMessage]);

  const label =
    unread.length === 0
      ? "Alerts, none unread"
      : `Alerts, ${unread.length} unread`;

  return (
    <>
      <button
        type="button"
        popoverTarget="alerts-panel"
        aria-label={label}
        className="relative p-2 text-header-text"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread.length > 0 && (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 min-w-5 bg-accent px-1 text-center text-xs leading-5 font-semibold text-accent-text"
          >
            {unread.length}
          </span>
        )}
      </button>
      <p ref={liveRef} role="status" className="sr-only" />
      <div
        ref={panelRef}
        id="alerts-panel"
        popover="auto"
        aria-label="Budget alerts"
        className="fixed inset-auto top-14 right-4 m-0 max-h-[70dvh] w-[min(26rem,calc(100vw-2rem))] overflow-y-auto border border-border bg-surface p-4 text-text"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <h2 className="font-semibold">
            Budget alerts
            <span className="block text-xs font-normal text-muted">
              {formatPeriod(period)}
            </span>
          </h2>
          {unread.length > 0 && (
            <button
              type="button"
              onClick={() => markAlertsRead(unread.map((alert) => alert.key))}
              className="text-link text-sm"
            >
              Mark all read
            </button>
          )}
        </div>
        <AlertList
          alerts={visible}
          onRead={(key) => markAlertsRead([key])}
          onDismiss={dismissAlert}
          onNavigate={() => panelRef.current?.hidePopover()}
        />
      </div>
    </>
  );
}
