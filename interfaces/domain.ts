import type { z } from "zod";
import type {
  accountSchema,
  demoDataSchema,
  expenseCategorySchema,
  incomeCategorySchema,
  monthlyBudgetSchema,
  scheduledItemSchema,
  scheduleRuleSchema,
  transactionSchema,
} from "@/lib/data/schemas";

export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type IncomeCategory = z.infer<typeof incomeCategorySchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type MonthlyBudget = z.infer<typeof monthlyBudgetSchema>;
export type ScheduleRule = z.infer<typeof scheduleRuleSchema>;
export type ScheduledItem = z.infer<typeof scheduledItemSchema>;
export type Account = z.infer<typeof accountSchema>;
export type DemoData = z.infer<typeof demoDataSchema>;
