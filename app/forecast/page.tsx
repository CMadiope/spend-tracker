import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ForecastSkeleton,
  ForecastView,
} from "@/components/forecast/forecast-view";
import { MonthPicker } from "@/components/ui/month-picker";
import { currentPeriod, today } from "@/lib/dates/clock";
import { shiftPeriod } from "@/lib/dates/period";
import { availablePeriods, getDemoData } from "@/lib/data/repository";
import { resolveMonth } from "@/lib/params/month";

export const metadata: Metadata = { title: "Forecast" };

async function Forecast({
  searchParams,
}: Pick<PageProps<"/forecast">, "searchParams">) {
  const { month } = await searchParams;
  await connection();
  const now = new Date();
  const todayDate = today(now);
  const current = currentPeriod(now);
  const data = getDemoData(todayDate);
  const periods = [
    ...availablePeriods(data),
    shiftPeriod(current, 1),
    shiftPeriod(current, 2),
  ];
  const period = resolveMonth(month, periods, current);

  return (
    <div className="flex flex-col gap-6">
      <MonthPicker period={period} periods={periods} basePath="/forecast" />
      <ForecastView
        period={period}
        today={todayDate}
        account={data.account}
        transactions={data.transactions}
        seedItems={data.scheduledItems}
      />
    </div>
  );
}

export default function ForecastPage({ searchParams }: PageProps<"/forecast">) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Forecast</h1>
      <Suspense fallback={<ForecastSkeleton />}>
        <Forecast searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
