import { z } from "zod";
import type { ScheduledItem } from "@/interfaces/domain";
import { expenseCategorySchema, isoDateSchema } from "@/lib/data/schemas";
import { parseRandsToCents } from "@/lib/money/parse";

export interface ScheduledItemFormValues {
  description: string;
  kind: ScheduledItem["kind"];
  amount: string;
  category: string;
  ruleKind: "monthly" | "once";
  day: string;
  date: string;
  adjust: boolean;
  startDate: string;
  endDate: string;
}

type FormErrors = Partial<Record<keyof ScheduledItemFormValues, string>>;

const formSchema = z.object({
  description: z.string().trim().min(1, "Enter a description").max(60),
  kind: z.enum(["income", "debit_order", "expense"]),
  amount: z.string().transform((value, ctx) => {
    const cents = parseRandsToCents(value);
    if (cents === null || cents === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Enter an amount like 1 500,00",
      });
      return z.NEVER;
    }
    return cents;
  }),
  category: z.union([z.literal(""), expenseCategorySchema]),
  ruleKind: z.enum(["monthly", "once"]),
  day: z.string(),
  date: z.string(),
  adjust: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
});

function scheduleErrors(values: ScheduledItemFormValues): FormErrors {
  const errors: FormErrors = {};
  if (values.ruleKind === "monthly") {
    const day = Number(values.day);
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      errors.day = "Enter a day from 1 to 31";
    }
    if (!isoDateSchema.safeParse(values.startDate).success) {
      errors.startDate = "Enter a start date";
    }
  } else if (!isoDateSchema.safeParse(values.date).success) {
    errors.date = "Enter a date";
  }
  if (values.endDate && values.endDate < values.startDate) {
    errors.endDate = "End date must be on or after the start date";
  }
  return errors;
}

export type ScheduledItemFormResult =
  | { success: true; item: ScheduledItem }
  | { success: false; errors: FormErrors };

export function parseScheduledItemForm(
  id: string,
  active: boolean,
  values: ScheduledItemFormValues,
): ScheduledItemFormResult {
  const result = formSchema.safeParse(values);
  const errors = scheduleErrors(values);
  for (const issue of result.error?.issues ?? []) {
    const field = issue.path[0] as keyof ScheduledItemFormValues;
    errors[field] ??= issue.message;
  }
  if (!result.success || Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const v = result.data;
  const once = v.ruleKind === "once";
  return {
    success: true,
    item: {
      id,
      kind: v.kind,
      description: v.description,
      amountCents: v.amount,
      ...(v.kind !== "income" && v.category ? { category: v.category } : {}),
      rule: once
        ? { kind: "once", date: v.date }
        : {
            kind: "monthly",
            day: Number(v.day),
            adjust: v.adjust ? "previous_business_day" : "none",
          },
      startDate: once ? v.date : v.startDate,
      ...(!once && v.endDate ? { endDate: v.endDate } : {}),
      active,
    },
  };
}

export function itemToFormValues(
  item: ScheduledItem | undefined,
  today: string,
): ScheduledItemFormValues {
  return {
    description: item?.description ?? "",
    kind: item?.kind ?? "debit_order",
    amount: item
      ? `${Math.floor(item.amountCents / 100)},${String(item.amountCents % 100).padStart(2, "0")}`
      : "",
    category: item?.category ?? "",
    ruleKind: item?.rule.kind ?? "monthly",
    day: item?.rule.kind === "monthly" ? String(item.rule.day) : "1",
    date: item?.rule.kind === "once" ? item.rule.date : today,
    adjust: item?.rule.kind === "monthly" && item.rule.adjust !== "none",
    startDate: item?.startDate ?? today,
    endDate: item?.endDate ?? "",
  };
}
