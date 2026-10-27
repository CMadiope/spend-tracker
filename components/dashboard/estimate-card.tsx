"use client";

import Link from "next/link";
import type { Account, ScheduledItem, Transaction } from "@/interfaces/domain";
import { formatDayMonth } from "@/lib/dates/format";
import { buildForecast } from "@/lib/forecast/forecast";
import { formatCents } from "@/lib/money/format";
import { resolveScheduledItems } from "@/lib/store/merge";
import { useStoredState } from "@/lib/store/store";

interface EstimateCardProps {
  period: string;
  today: string;
  account: Account;
  transactions: Transaction[];
  seedItems: ScheduledItem[];
}

export function EstimateCard({
  period,
  today,
  account,
  transactions,
  seedItems,
}: EstimateCardProps) {
  const stored = useStoredState();
  const forecast = stored
    ? buildForecast({
        account,
        transactions,
        items: resolveScheduledItems(seedItems, stored),
        today,
        period,
      })
    : null;

  return (
    <section
      aria-labelledby="estimate-heading"
      className="flex flex-col gap-4 border border-border bg-surface p-4"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="estimate-heading" className="font-semibold">
          Month-end estimate
        </h2>
        <Link href={`/forecast?month=${period}`} className="text-link text-sm">
          View forecast
        </Link>
      </div>
      {!forecast ? (
        <div aria-hidden className="h-28" />
      ) : !forecast.available ? (
        <p className="text-sm text-muted">
          Forecast not available for past months.
        </p>
      ) : (
        <>
          <div>
            <p className="text-3xl font-semibold">
              {formatCents(forecast.projectedBalanceCents)}
            </p>
            <p className="text-xs text-muted">
              Estimate · current balance{" "}
              {formatCents(forecast.currentBalanceCents)} on{" "}
              {formatDayMonth(today)}
            </p>
          </div>
          {forecast.firstNegativeDate && (
            <p className="bg-danger-surface px-3 py-2 text-sm text-danger">
              Balance may go negative on{" "}
              {formatDayMonth(forecast.firstNegativeDate)}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
