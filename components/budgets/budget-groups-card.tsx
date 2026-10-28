import type { BudgetGroups } from "@/lib/budgets/insights";
import { categoryLabels } from "@/lib/data/categories";
import { formatCents } from "@/lib/money/format";
import { SpendSplit } from "./spend-split";

interface BudgetGroupsCardProps {
  budgetCents: number | null;
  groups: BudgetGroups;
}

function Group({
  title,
  description,
  totalCents,
  items,
  tone,
}: {
  title: string;
  description: string;
  totalCents: number;
  items: BudgetGroups["budgeted"];
  tone: "budgeted" | "unbudgeted";
}) {
  return (
    <div className="flex flex-col gap-2 border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <span
          className={`shrink-0 px-2 py-0.5 text-sm font-semibold tabular-nums ${tone === "budgeted" ? "bg-accent text-accent-text" : "bg-warning-surface text-warning"}`}
        >
          {formatCents(totalCents)}
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted">None this month.</p>
      ) : (
        <ul className="flex flex-col gap-1 text-sm">
          {items.map(({ category, cents }) => (
            <li key={category} className="flex justify-between gap-3">
              <span>{categoryLabels[category]}</span>
              <span className="text-muted tabular-nums">
                {formatCents(cents)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function BudgetGroupsCard({
  budgetCents,
  groups,
}: BudgetGroupsCardProps) {
  return (
    <section
      aria-labelledby="budget-groups-heading"
      className="flex flex-col gap-4 border border-border bg-surface p-4"
    >
      <h2 id="budget-groups-heading" className="font-semibold">
        Budget groups
      </h2>
      <SpendSplit
        budgetCents={budgetCents}
        budgetedCents={groups.budgetedCents}
        unbudgetedCents={groups.unbudgetedCents}
      />
      <div className="grid gap-3 md:grid-cols-2">
        <Group
          title="Budgeted"
          description="Expenses you planned for"
          totalCents={groups.budgetedCents}
          items={groups.budgeted}
          tone="budgeted"
        />
        <Group
          title="Unbudgeted"
          description="Expenses you didn't plan for"
          totalCents={groups.unbudgetedCents}
          items={groups.unbudgeted}
          tone="unbudgeted"
        />
      </div>
    </section>
  );
}
