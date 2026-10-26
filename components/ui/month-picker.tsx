import Link from "next/link";
import { formatPeriod } from "@/lib/dates/format";

interface MonthPickerProps {
  period: string;
  periods: readonly string[];
  basePath: string;
}

export function MonthPicker({ period, periods, basePath }: MonthPickerProps) {
  const index = periods.indexOf(period);
  const previous = periods[index - 1];
  const next = periods[index + 1];
  const linkClass = "px-3 py-2 text-muted hover:text-text";

  return (
    <nav aria-label="Month" className="flex items-center gap-1">
      {previous ? (
        <Link
          href={`${basePath}?month=${previous}`}
          className={linkClass}
          aria-label={`Previous month, ${formatPeriod(previous)}`}
        >
          ←
        </Link>
      ) : (
        <span aria-hidden className="px-3 py-2 text-border">
          ←
        </span>
      )}
      <span className="min-w-36 text-center font-medium" aria-current="date">
        {formatPeriod(period)}
      </span>
      {next ? (
        <Link
          href={`${basePath}?month=${next}`}
          className={linkClass}
          aria-label={`Next month, ${formatPeriod(next)}`}
        >
          →
        </Link>
      ) : (
        <span aria-hidden className="px-3 py-2 text-border">
          →
        </span>
      )}
    </nav>
  );
}
