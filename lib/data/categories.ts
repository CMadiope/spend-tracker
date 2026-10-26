import type { ExpenseCategory, IncomeCategory } from "@/interfaces/domain";

export const categoryLabels: Record<ExpenseCategory | IncomeCategory, string> =
  {
    housing: "Housing",
    groceries: "Groceries",
    transport: "Transport",
    utilities: "Utilities",
    health: "Health",
    entertainment: "Entertainment",
    shopping: "Shopping",
    other: "Other",
    salary: "Salary",
    other_income: "Other income",
  };
