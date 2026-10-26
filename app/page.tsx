import { connection } from "next/server";
import { Suspense } from "react";
import { KpiCards, KpiCardsSkeleton } from "@/components/dashboard/kpi-cards";
import { MonthPicker } from "@/components/ui/month-picker";
import { today } from "@/lib/dates/clock";
import { availablePeriods, getDemoData } from "@/lib/data/repository";
import { resolveMonth } from "@/lib/params/month";
import { summarisePeriod } from "@/lib/spending/spending";

async function Overview({
  searchParams,
}: Pick<PageProps<"/">, "searchParams">) {
  const { month } = await searchParams;
  await connection();
  const data = getDemoData(today());
  const periods = availablePeriods(data);
  const period = resolveMonth(month, periods);

  return (
    <div className="flex flex-col gap-6">
      <MonthPicker period={period} periods={periods} basePath="/" />
      <section aria-label="Key figures">
        <KpiCards summary={summarisePeriod(data.transactions, period)} />
      </section>
    </div>
  );
}

export default function OverviewPage({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Overview</h1>
      <Suspense fallback={<KpiCardsSkeleton />}>
        <Overview searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
