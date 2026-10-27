"use client";

import { useState } from "react";
import type { ScheduledItem } from "@/interfaces/domain";
import { formatDayMonth } from "@/lib/dates/format";
import { formatCents } from "@/lib/money/format";
import { ScheduledItemForm } from "./scheduled-item-form";

interface ScheduledItemsProps {
  items: readonly ScheduledItem[];
  today: string;
  onChange: (items: ScheduledItem[]) => void;
}

function describeRule(item: ScheduledItem): string {
  if (item.rule.kind === "once")
    return `Once on ${formatDayMonth(item.rule.date)}`;
  const weekend =
    item.rule.adjust === "previous_business_day" ? ", Friday if a weekend" : "";
  return `Monthly on day ${item.rule.day}${weekend}`;
}

export function ScheduledItems({
  items,
  today,
  onChange,
}: ScheduledItemsProps) {
  const [editing, setEditing] = useState<string | "new" | null>(null);

  const save = (item: ScheduledItem) => {
    const exists = items.some((i) => i.id === item.id);
    onChange(
      exists
        ? items.map((i) => (i.id === item.id ? item : i))
        : [...items, item],
    );
    setEditing(null);
  };

  return (
    <section
      aria-labelledby="scheduled-heading"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="scheduled-heading" className="font-semibold">
          Scheduled items
        </h2>
        {editing === null && (
          <button
            type="button"
            onClick={() => setEditing("new")}
            className="border border-border px-4 py-2 font-medium"
          >
            Add item
          </button>
        )}
      </div>

      {editing === "new" && (
        <ScheduledItemForm
          item={undefined}
          today={today}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      <ul className="divide-y divide-border border border-border bg-surface px-4">
        {items.map((item) =>
          editing === item.id ? (
            <li key={item.id} className="py-4">
              <ScheduledItemForm
                item={item}
                today={today}
                onSave={save}
                onCancel={() => setEditing(null)}
              />
            </li>
          ) : (
            <li
              key={item.id}
              className={`flex flex-wrap items-center justify-between gap-3 py-3 ${item.active ? "" : "text-muted"}`}
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {item.description}
                  {!item.active && (
                    <span className="ml-2 bg-info-surface px-2 py-0.5 text-xs text-info">
                      Paused
                    </span>
                  )}
                </p>
                <p className="text-sm text-muted">{describeRule(item)}</p>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`tabular-nums ${item.kind === "income" ? "text-money-in" : ""}`}
                >
                  {item.kind === "income" ? "+" : "−"}
                  {formatCents(item.amountCents)}
                </span>
                <button
                  type="button"
                  onClick={() => setEditing(item.id)}
                  aria-label={`Edit, ${item.description}`}
                  className="text-link text-sm"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange(
                      items.map((i) =>
                        i.id === item.id ? { ...i, active: !i.active } : i,
                      ),
                    )
                  }
                  aria-label={`${item.active ? "Pause" : "Resume"}, ${item.description}`}
                  className="text-link text-sm"
                >
                  {item.active ? "Pause" : "Resume"}
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
