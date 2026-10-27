import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  BudgetsSkeleton,
  BudgetsView,
} from "@/components/budgets/budgets-view";
import { MonthPicker } from "@/components/ui/month-picker";
import { today } from "@/lib/dates/clock";
import { availablePeriods, getDemoData } from "@/lib/data/repository";
import { resolveMonth } from "@/lib/params/month";
import { transactionsInPeriod } from "@/lib/spending/spending";

export const metadata: Metadata = { title: "Budgets" };

async function Budgets({
  searchParams,
}: Pick<PageProps<"/budgets">, "searchParams">) {
  const { month } = await searchParams;
  await connection();
  const data = getDemoData(today());
  const periods = availablePeriods(data);
  const period = resolveMonth(month, periods);

  return (
    <div className="flex flex-col gap-6">
      <MonthPicker period={period} periods={periods} basePath="/budgets" />
      <BudgetsView
        key={period}
        period={period}
        seedBudgets={data.budgets}
        transactions={transactionsInPeriod(data.transactions, period)}
      />
    </div>
  );
}

export default function BudgetsPage({ searchParams }: PageProps<"/budgets">) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Budgets</h1>
      <Suspense fallback={<BudgetsSkeleton />}>
        <Budgets searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
