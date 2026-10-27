"use client";

import { useRef, useState } from "react";
import type { ScheduledItem } from "@/interfaces/domain";
import { categoryLabels } from "@/lib/data/categories";
import { expenseCategories } from "@/lib/data/schemas";
import {
  type ScheduledItemFormValues,
  itemToFormValues,
  parseScheduledItemForm,
} from "@/lib/forecast/validation";

interface ScheduledItemFormProps {
  item: ScheduledItem | undefined;
  today: string;
  onSave: (item: ScheduledItem) => void;
  onCancel: () => void;
}

type Field = keyof ScheduledItemFormValues;

const fieldOrder: Field[] = [
  "description",
  "amount",
  "day",
  "date",
  "startDate",
  "endDate",
];

const inputClass = (error?: string) =>
  `border bg-background px-3 py-2 text-text ${error ? "border-danger" : "border-border"}`;

export function ScheduledItemForm({
  item,
  today,
  onSave,
  onCancel,
}: ScheduledItemFormProps) {
  const [values, setValues] = useState(() => itemToFormValues(item, today));
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends Field>(name: K, value: ScheduledItemFormValues[K]) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const id = item?.id ?? `item-${Date.now().toString(36)}`;
    const result = parseScheduledItemForm(id, item?.active ?? true, values);
    if (!result.success) {
      setErrors(result.errors);
      const first = fieldOrder.find((field) => result.errors[field]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    onSave(result.item);
  }

  function textField(name: Field, label: string, type = "text") {
    const error = errors[name];
    return (
      <div className="flex flex-col gap-1 text-sm">
        <label htmlFor={`item-${name}`} className="text-muted">
          {label}
        </label>
        <input
          id={`item-${name}`}
          name={name}
          type={type}
          inputMode={name === "amount" ? "decimal" : undefined}
          autoComplete="off"
          value={values[name] as string}
          onChange={(e) => set(name, e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `item-${name}-error` : undefined}
          className={inputClass(error)}
        />
        {error && (
          <span id={`item-${name}-error`} className="text-xs text-danger">
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
      aria-labelledby="item-form-heading"
      className="flex flex-col gap-4 border border-border bg-surface p-4"
    >
      <h3 id="item-form-heading" className="font-semibold">
        {item ? `Edit ${item.description}` : "Add scheduled item"}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {textField("description", "Description")}
        {textField("amount", "Amount (R)")}
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Type</span>
          <select
            name="kind"
            value={values.kind}
            onChange={(e) =>
              set("kind", e.target.value as ScheduledItem["kind"])
            }
            className={inputClass()}
          >
            <option value="debit_order">Debit order</option>
            <option value="expense">Expected expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        {values.kind !== "income" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Category</span>
            <select
              name="category"
              value={values.category}
              onChange={(e) => set("category", e.target.value)}
              className={inputClass()}
            >
              <option value="">None</option>
              {expenseCategories.map((category) => (
                <option key={category} value={category}>
                  {categoryLabels[category]}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Schedule</legend>
        <div className="flex gap-6 text-sm">
          {(["monthly", "once"] as const).map((ruleKind) => (
            <label key={ruleKind} className="flex items-center gap-2">
              <input
                type="radio"
                name="ruleKind"
                value={ruleKind}
                checked={values.ruleKind === ruleKind}
                onChange={() => set("ruleKind", ruleKind)}
              />
              {ruleKind === "monthly" ? "Every month" : "Once"}
            </label>
          ))}
        </div>
        {values.ruleKind === "monthly" ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {textField("day", "Day of month")}
            {textField("startDate", "Starts", "date")}
            {textField("endDate", "Ends (optional)", "date")}
            <label className="flex items-center gap-2 text-sm sm:col-span-3">
              <input
                type="checkbox"
                name="adjust"
                checked={values.adjust}
                onChange={(e) => set("adjust", e.target.checked)}
              />
              Move to the Friday before when it falls on a weekend
            </label>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {textField("date", "Date", "date")}
          </div>
        )}
      </fieldset>

      <div className="flex gap-3">
        <button
          type="submit"
          className="bg-accent px-4 py-2 font-medium text-accent-text"
        >
          Save item
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
