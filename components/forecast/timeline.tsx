import type { TimelineRow } from "@/lib/forecast/forecast";
import { formatWeekdayDayMonth } from "@/lib/dates/format";
import { formatCents, formatSignedCents } from "@/lib/money/format";

const kindLabels = {
  income: "Income",
  debit_order: "Debit order",
  expense: "Expected expense",
};

export function Timeline({ rows }: { rows: TimelineRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        No scheduled events between now and the end of the month.
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">
        Scheduled events with the running balance after each one
      </caption>
      <thead>
        <tr className="border-b border-border text-left text-muted">
          <th scope="col" className="py-2 font-medium">
            Date
          </th>
          <th scope="col" className="py-2 font-medium">
            Event
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Amount
          </th>
          <th scope="col" className="py-2 text-right font-medium">
            Balance
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-b border-border last:border-0">
            <td className="py-3 pr-3 whitespace-nowrap text-muted">
              {formatWeekdayDayMonth(row.date)}
            </td>
            <th scope="row" className="py-3 pr-3 text-left font-normal">
              <span className="block font-medium">{row.description}</span>
              <span className="text-xs text-muted">{kindLabels[row.kind]}</span>
            </th>
            <td
              className={`py-3 pr-3 text-right whitespace-nowrap tabular-nums ${row.signedCents > 0 ? "text-money-in" : ""}`}
            >
              {formatSignedCents(row.signedCents)}
            </td>
            <td
              className={`py-3 text-right whitespace-nowrap tabular-nums ${row.balanceAfterCents < 0 ? "text-danger" : ""}`}
            >
              {formatCents(row.balanceAfterCents)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
