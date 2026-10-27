import type { Transaction } from "@/interfaces/domain";
import { categoryLabels } from "@/lib/data/categories";
import { formatDayMonth } from "@/lib/dates/format";
import { formatCents } from "@/lib/money/format";

function isMoneyIn(t: Transaction): boolean {
  return (
    t.type === "income" ||
    t.type === "refund" ||
    (t.type === "transfer" && t.direction === "in")
  );
}

function details(t: Transaction): string {
  const parts = [formatDayMonth(t.date)];
  if ("merchant" in t && t.merchant) parts.push(t.merchant);
  parts.push(t.type === "transfer" ? "Transfer" : categoryLabels[t.category]);
  if (t.type === "refund") parts.push("Refund");
  return parts.join(" · ");
}

export function TransactionList({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        No transactions found.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border">
      {transactions.map((t) => {
        const moneyIn = isMoneyIn(t);
        return (
          <li
            key={t.id}
            className="flex items-center justify-between gap-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium">{t.description}</p>
              <p className="truncate text-sm text-muted">{details(t)}</p>
            </div>
            <p
              className={`shrink-0 tabular-nums ${moneyIn ? "text-money-in" : ""}`}
            >
              <span className="sr-only">
                {moneyIn ? "Money in" : "Money out"}
              </span>
              {moneyIn ? "+" : "−"}
              {formatCents(t.amountCents)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
