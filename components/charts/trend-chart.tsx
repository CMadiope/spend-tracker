import { formatPeriod, formatShortMonth } from "@/lib/dates/format";
import { formatCents } from "@/lib/money/format";
import { ChartCard } from "./chart-card";

interface TrendChartProps {
  points: { period: string; netExpensesCents: number }[];
  selected: string;
}

export function TrendChart({ points, selected }: TrendChartProps) {
  const max = Math.max(...points.map((p) => p.netExpensesCents), 1);

  return (
    <ChartCard
      title="Spending trend"
      subtitle="Net expenses per month, after refunds"
      table={{
        headers: ["Month", "Net expenses"],
        rows: points.map((p) => [
          formatPeriod(p.period),
          formatCents(p.netExpensesCents),
        ]),
      }}
    >
      <div className="flex h-52 items-end gap-3 border-b border-chart-grid">
        {points.map((p) => (
          <div
            key={p.period}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span
              className={`text-xs tabular-nums ${p.period === selected ? "text-text" : "text-muted"}`}
            >
              {formatCents(p.netExpensesCents)}
            </span>
            <div
              className={`w-full max-w-16 ${p.period === selected ? "bg-chart-bar" : "bg-chart-bar-muted"}`}
              style={{ height: `${(p.netExpensesCents / max) * 75}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-3">
        {points.map((p) => (
          <span
            key={p.period}
            className={`flex-1 text-center text-xs ${p.period === selected ? "font-semibold text-text" : "text-muted"}`}
          >
            {formatShortMonth(p.period)}
          </span>
        ))}
      </div>
    </ChartCard>
  );
}
