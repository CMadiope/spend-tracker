import { z } from "zod";
import { isIsoDate } from "@/lib/dates/calendar";
import { isPeriod } from "@/lib/dates/period";

export const expenseCategories = [
  "housing",
  "groceries",
  "transport",
  "utilities",
  "health",
  "entertainment",
  "shopping",
  "other",
] as const;

export const incomeCategories = ["salary", "other_income"] as const;

export const centsSchema = z.int().nonnegative();
export const isoDateSchema = z.string().refine(isIsoDate, "Invalid date");
export const periodSchema = z.string().refine(isPeriod, "Invalid month");
export const expenseCategorySchema = z.enum(expenseCategories);
export const incomeCategorySchema = z.enum(incomeCategories);

const transactionBase = {
  id: z.string().min(1),
  amountCents: centsSchema,
  date: isoDateSchema,
  description: z.string().min(1),
};

export const transactionSchema = z.discriminatedUnion("type", [
  z.object({
    ...transactionBase,
    type: z.literal("expense"),
    category: expenseCategorySchema,
    merchant: z.string().optional(),
  }),
  z.object({
    ...transactionBase,
    type: z.literal("refund"),
    category: expenseCategorySchema,
    merchant: z.string().optional(),
    refundOf: z.string().optional(),
  }),
  z.object({
    ...transactionBase,
    type: z.literal("income"),
    category: incomeCategorySchema,
  }),
  z.object({
    ...transactionBase,
    type: z.literal("transfer"),
    direction: z.enum(["in", "out"]),
  }),
]);

export const monthlyBudgetSchema = z.object({
  period: periodSchema,
  totalCents: centsSchema,
  categories: z.partialRecord(expenseCategorySchema, centsSchema),
});

export const scheduleRuleSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("monthly"),
    day: z.int().min(1).max(31),
    adjust: z.enum(["none", "previous_business_day"]),
  }),
  z.object({ kind: z.literal("once"), date: isoDateSchema }),
]);

export const scheduledItemSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["income", "debit_order", "expense"]),
    description: z.string().min(1),
    amountCents: centsSchema,
    category: expenseCategorySchema.optional(),
    rule: scheduleRuleSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema.optional(),
    active: z.boolean(),
  })
  .refine((item) => !item.endDate || item.startDate <= item.endDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const accountSchema = z.object({
  name: z.string().min(1),
  maskedNumber: z.string().min(1),
  openingBalanceCents: z.int(),
  openingDate: isoDateSchema,
});

export const demoDataSchema = z.object({
  account: accountSchema,
  transactions: z.array(transactionSchema),
  budgets: z.array(monthlyBudgetSchema),
  scheduledItems: z.array(scheduledItemSchema),
});
