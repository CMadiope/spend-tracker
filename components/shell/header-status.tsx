import { connection } from "next/server";
import { AlertBell } from "@/components/alerts/alert-bell";
import { currentPeriod, today } from "@/lib/dates/clock";
import { getDemoData } from "@/lib/data/repository";
import { transactionsInPeriod } from "@/lib/spending/spending";

export async function HeaderStatus() {
  await connection();
  const data = getDemoData(today());
  const period = currentPeriod();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-muted sm:inline">
        {data.account.name} {data.account.maskedNumber}
      </span>
      <AlertBell
        period={period}
        seedBudgets={data.budgets}
        transactions={transactionsInPeriod(data.transactions, period)}
      />
    </div>
  );
}

export function HeaderStatusFallback() {
  return <div aria-hidden className="size-9" />;
}
