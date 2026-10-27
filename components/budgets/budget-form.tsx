"use client";

import { useRef, useState } from "react";
import type { MonthlyBudget } from "@/interfaces/domain";
import {
  type BudgetFormValues,
  allocatedCents,
  centsToInput,
  parseBudgetForm,
} from "@/lib/budgets/validation";
import { categoryLabels } from "@/lib/data/categories";
import { expenseCategories } from "@/lib/data/schemas";
import { formatCents } from "@/lib/money/format";

interface BudgetFormProps {
  period: string;
  budget: MonthlyBudget | undefined;
  onSave: (budget: MonthlyBudget) => void;
  onCancel: () => void;
}

const fields = ["total", ...expenseCategories] as const;

function initialValues(budget: MonthlyBudget | undefined): BudgetFormValues {
  return Object.fromEntries(
    fields.map((field) => [
      field,
      centsToInput(
        field === "total" ? budget?.totalCents : budget?.categories[field],
      ),
    ]),
  ) as BudgetFormValues;
}

export function BudgetForm({
  period,
  budget,
  onSave,
  onCancel,
}: BudgetFormProps) {
  const [values, setValues] = useState(() => initialValues(budget));
  const [errors, setErrors] = useState<
    Partial<Record<keyof BudgetFormValues, string>>
  >({});
  const formRef = useRef<HTMLFormElement>(null);

  const preview = parseBudgetForm(period, values);
  const overAllocatedBy =
    preview.success &&
    allocatedCents(preview.budget) - preview.budget.totalCents;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = parseBudgetForm(period, values);
    if (!result.success) {
      setErrors(result.errors);
      const first = fields.find((field) => result.errors[field]);
      formRef.current
        ?.querySelector<HTMLInputElement>(`[name="${first}"]`)
        ?.focus();
      return;
    }
    onSave(result.budget);
  }

  function field(name: keyof BudgetFormValues, label: string, hint?: string) {
    const error = errors[name];
    const describedBy = [error && `${name}-error`, hint && `${name}-hint`]
      .filter(Boolean)
      .join(" ");
    return (
      <div key={name} className="flex flex-col gap-1 text-sm">
        <label htmlFor={`budget-${name}`} className="text-muted">
          {label}
        </label>
        <input
          id={`budget-${name}`}
          name={name}
          inputMode="decimal"
          autoComplete="off"
          value={values[name]}
          onChange={(e) => {
            setValues((v) => ({ ...v, [name]: e.target.value }));
            setErrors((current) => ({ ...current, [name]: undefined }));
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className={`border bg-background px-3 py-2 text-text ${error ? "border-danger" : "border-border"}`}
        />
        {hint && (
          <span id={`${name}-hint`} className="text-xs text-muted">
            {hint}
          </span>
        )}
        {error && (
          <span id={`${name}-error`} className="text-xs text-danger">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="budget-form-heading"
      className="flex flex-col gap-5 border border-border bg-surface p-4"
    >
      <h2 id="budget-form-heading" className="font-semibold">
        Edit budgets
      </h2>
      {field("total", "Overall monthly budget (R)")}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">
          Category budgets (R)
        </legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {expenseCategories.map((category) =>
            field(category, categoryLabels[category], "Leave blank for none"),
          )}
        </div>
      </fieldset>
      {overAllocatedBy !== false && overAllocatedBy > 0 && (
        <p
          role="status"
          className="bg-warning-surface px-3 py-2 text-sm text-warning"
        >
          Category budgets add up to {formatCents(overAllocatedBy)} more than
          the overall budget. You can still save.
        </p>
      )}
      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-accent px-4 py-2 font-medium text-accent-text"
        >
          Save budgets
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-border px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
