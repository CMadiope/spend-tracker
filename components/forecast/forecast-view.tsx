"use client";

import Link from "next/link";
import type { Account, ScheduledItem, Transaction } from "@/interfaces/domain";
import { formatDayMonth } from "@/lib/dates/format";
import { buildForecast } from "@/lib/forecast/forecast";
import { formatCents } from "@/lib/money/format";
import { resolveScheduledItems } from "@/lib/store/merge";
import { saveScheduledItems, useStoredState } from "@/lib/store/store";
import { ScheduledItems } from "./scheduled-items";
import { Timeline } from "./timeline";

interface ForecastViewProps {
  period: string;
  today: string;
  account: Account;
  transactions: Transaction[];
  seedItems: ScheduledItem[];
}

export function ForecastSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-22 border border-border bg-surface" />
        ))}
      </div>
      <div className="h-64 border border-border bg-surface" />
    </div>
  );
}

function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="border border-border bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
      {note && <dd className="mt-1 text-xs text-muted">{note}</dd>}
    </div>
  );
}

export function ForecastView({
  period,
  today,
  account,
  transactions,
  seedItems,
}: ForecastViewProps) {
  const stored = useStoredState();
  if (!stored) return <ForecastSkeleton />;

  const items = resolveScheduledItems(seedItems, stored);
  const forecast = buildForecast({
    account,
    transactions,
    items,
    today,
    period,
  });

  return (
    <div className="flex flex-col gap-8">
      {forecast.available ? (
        <>
          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Figure
              label="Current balance"
              value={formatCents(forecast.currentBalanceCents)}
              note={`As of ${formatDayMonth(today)}`}
            />
            <Figure
              label="Month-end estimate"
              value={formatCents(forecast.projectedBalanceCents)}
              note="Estimate from scheduled items"
            />
            <Figure
              label="Scheduled income"
              value={formatCents(forecast.incomeCents)}
            />
            <Figure
              label="Scheduled outflows"
              value={formatCents(forecast.outflowCents)}
            />
          </dl>

          {forecast.firstNegativeDate && (
            <p className="flex items-center gap-2 bg-danger-surface px-4 py-3 text-sm text-danger">
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                className="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2l6.5 12h-13zM8 6.5v3.5M8 12v.5" />
              </svg>
              Balance may go negative on{" "}
              {formatDayMonth(forecast.firstNegativeDate)}.
            </p>
          )}

          <section
            aria-labelledby="timeline-heading"
            className="border border-border bg-surface p-4"
          >
            <h2 id="timeline-heading" className="mb-2 font-semibold">
              Timeline
            </h2>
            <Timeline rows={forecast.timeline} />
          </section>
        </>
      ) : (
        <p className="border border-border bg-surface p-4 text-muted">
          Forecast not available for past months —{" "}
          <Link
            href={`/transactions?month=${period}`}
            className="text-link text-text"
          >
            see actuals
          </Link>{" "}
          or{" "}
          <Link href="/forecast" className="text-link text-text">
            view this month&apos;s forecast
          </Link>
          .
        </p>
      )}

      {forecast.available && (
        <ScheduledItems
          items={items}
          today={today}
          onChange={saveScheduledItems}
        />
      )}
    </div>
  );
}
