import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle: string;
  table: { headers: [string, string]; rows: [string, string][] };
  children: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  table,
  children,
}: ChartCardProps) {
  return (
    <section className="flex flex-col gap-4 border border-border bg-surface p-4">
      <header>
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted">{subtitle}</p>
      </header>
      <div aria-hidden>{children}</div>
      <details className="text-sm">
        <summary className="cursor-pointer text-muted hover:text-text">
          Show as table
        </summary>
        <table className="mt-3 w-full">
          <caption className="sr-only">
            {title}, {subtitle.toLowerCase()}
          </caption>
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th scope="col" className="py-2 font-medium">
                {table.headers[0]}
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                {table.headers[1]}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map(([label, value]) => (
              <tr key={label} className="border-b border-border last:border-0">
                <th scope="row" className="py-2 text-left font-normal">
                  {label}
                </th>
                <td className="py-2 text-right tabular-nums">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  );
}
