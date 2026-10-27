"use client";

import { useState } from "react";
import type { MonthlyBudget, Transaction } from "@/interfaces/domain";
import { periodBudgetUsage } from "@/lib/budgets/status";
import { resolveBudget } from "@/lib/store/merge";
import { saveBudget, useStoredState } from "@/lib/store/store";
import { BudgetCard } from "./budget-card";
import { BudgetForm } from "./budget-form";

interface BudgetsViewProps {
  period: string;
  seedBudgets: MonthlyBudget[];
  transactions: Transaction[];
}

export function BudgetsSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-4">
      <div className="h-36 border border-border bg-surface" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-36 border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}

export function BudgetsView({
  period,
  seedBudgets,
  transactions,
}: BudgetsViewProps) {
  const stored = useStoredState();
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  if (!stored) return <BudgetsSkeleton />;

  const budget = resolveBudget(seedBudgets, stored, period);
  const usage = periodBudgetUsage(budget, transactions, period);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p role="status" className="text-sm text-positive">
          {message}
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(true);
              setMessage("");
            }}
            className="border border-border px-4 py-2 font-medium"
          >
            Edit budgets
          </button>
        )}
      </div>

      {editing && (
        <BudgetForm
          period={period}
          budget={budget}
          onSave={(next) => {
            saveBudget(next);
            setEditing(false);
            setMessage("Budgets saved.");
          }}
          onCancel={() => setEditing(false)}
        />
      )}

      <BudgetCard usage={usage.overall} />
      <section aria-labelledby="category-budgets-heading">
        <h2
          id="category-budgets-heading"
          className="mb-3 text-sm font-medium text-muted"
        >
          Category budgets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {usage.categories.map((categoryUsage) => (
            <BudgetCard key={categoryUsage.scope} usage={categoryUsage} />
          ))}
        </div>
      </section>
    </div>
  );
}
