import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionList } from "@/components/transactions/transaction-list";
import { MonthPicker } from "@/components/ui/month-picker";
import { today } from "@/lib/dates/clock";
import { availablePeriods, getDemoData } from "@/lib/data/repository";
import { resolveMonth } from "@/lib/params/month";
import {
  filterTransactions,
  parseTransactionFilters,
} from "@/lib/transactions/filter";

export const metadata: Metadata = { title: "Transactions" };

async function Transactions({
  searchParams,
}: Pick<PageProps<"/transactions">, "searchParams">) {
  const params = await searchParams;
  await connection();
  const data = getDemoData(today());
  const periods = availablePeriods(data);
  const period = resolveMonth(params.month, periods);
  const filters = parseTransactionFilters(params);
  const results = filterTransactions(data.transactions, period, filters);

  return (
    <div className="flex flex-col gap-6">
      <MonthPicker period={period} periods={periods} basePath="/transactions" />
      <TransactionFilters period={period} filters={filters} />
      <section aria-labelledby="results-heading">
        <h2 id="results-heading" className="text-sm text-muted">
          {results.length}{" "}
          {results.length === 1 ? "transaction" : "transactions"}
        </h2>
        <TransactionList transactions={results} />
      </section>
    </div>
  );
}

export default function TransactionsPage({
  searchParams,
}: PageProps<"/transactions">) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <Suspense fallback={<p className="text-muted">Loading transactions…</p>}>
        <Transactions searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
