import { expect, test } from "vitest";
import {
  allocatedCents,
  parseBudgetForm,
  type BudgetFormValues,
} from "./validation";

const blank: BudgetFormValues = {
  total: "",
  housing: "",
  groceries: "",
  transport: "",
  utilities: "",
  health: "",
  entertainment: "",
  shopping: "",
  other: "",
};

test("parses amounts and treats blank categories as not configured", () => {
  const result = parseBudgetForm("2026-10", {
    ...blank,
    total: "R 10 000",
    groceries: "4 500,00",
    transport: "0",
  });
  expect(result).toEqual({
    success: true,
    budget: {
      period: "2026-10",
      totalCents: 1_000_000,
      categories: { groceries: 450_000, transport: 0 },
    },
  });
});

test("reports invalid fields inline and allows allocations above the total", () => {
  expect(
    parseBudgetForm("2026-10", { ...blank, total: "", shopping: "-5" }),
  ).toEqual({
    success: false,
    errors: {
      total: "Enter an amount like 1 500,00",
      shopping: "Enter an amount like 1 500,00",
    },
  });

  const over = parseBudgetForm("2026-10", {
    ...blank,
    total: "100",
    groceries: "80",
    shopping: "40",
  });
  expect(over.success && allocatedCents(over.budget)).toBe(12_000);
});
