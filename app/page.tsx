import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CategoryBars } from "@/components/charts/category-bars";
import { TrendChart } from "@/components/charts/trend-chart";
import { BudgetSummary } from "@/components/dashboard/budget-summary";
import { EstimateCard } from "@/components/dashboard/estimate-card";
import { KpiCards, KpiCardsSkeleton } from "@/components/dashboard/kpi-cards";
import { TransactionList } from "@/components/transactions/transaction-list";
import { MonthPicker } from "@/components/ui/month-picker";
import { today } from "@/lib/dates/clock";
import { availablePeriods, getDemoData } from "@/lib/data/repository";
import { resolveMonth } from "@/lib/params/month";
import {
  categoryBreakdown,
  spendingTrend,
  summarisePeriod,
  transactionsInPeriod,
} from "@/lib/spending/spending";
import { filterTransactions } from "@/lib/transactions/filter";

async function Overview({
  searchParams,
}: Pick<PageProps<"/">, "searchParams">) {
  const { month } = await searchParams;
  await connection();
  const todayDate = today();
  const data = getDemoData(todayDate);
  const periods = availablePeriods(data);
  const period = resolveMonth(month, periods);

  return (
    <div className="flex flex-col gap-6">
      <MonthPicker period={period} periods={periods} basePath="/" />
      <section aria-label="Key figures">
        <KpiCards summary={summarisePeriod(data.transactions, period)} />
      </section>
      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetSummary
          period={period}
          seedBudgets={data.budgets}
          transactions={transactionsInPeriod(data.transactions, period)}
        />
        <EstimateCard
          period={period}
          today={todayDate}
          account={data.account}
          transactions={data.transactions}
          seedItems={data.scheduledItems}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart
          points={spendingTrend(data.transactions, periods)}
          selected={period}
        />
        <CategoryBars
          categories={categoryBreakdown(data.transactions, period)}
        />
      </div>
      <section
        aria-labelledby="recent-heading"
        className="border border-border bg-surface p-4"
      >
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="recent-heading" className="font-semibold">
            Recent transactions
          </h2>
          <Link
            href={`/transactions?month=${period}`}
            className="text-link text-sm"
          >
            View all
          </Link>
        </div>
        <TransactionList
          transactions={filterTransactions(data.transactions, period, {}).slice(
            0,
            5,
          )}
        />
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
