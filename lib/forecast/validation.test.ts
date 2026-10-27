import { expect, test } from "vitest";
import { itemToFormValues, parseScheduledItemForm } from "./validation";

test("builds a scheduled item from form values and reports errors inline", () => {
  const values = {
    ...itemToFormValues(undefined, "2026-10-27"),
    description: "Gym",
    amount: "450",
    category: "health",
    day: "31",
  };
  expect(parseScheduledItemForm("gym", true, values)).toEqual({
    success: true,
    item: {
      id: "gym",
      kind: "debit_order",
      description: "Gym",
      amountCents: 45_000,
      category: "health",
      rule: { kind: "monthly", day: 31, adjust: "none" },
      startDate: "2026-10-27",
      active: true,
    },
  });

  expect(
    parseScheduledItemForm("gym", true, {
      ...values,
      description: " ",
      amount: "0",
      day: "32",
      endDate: "2026-01-01",
    }),
  ).toEqual({
    success: false,
    errors: {
      description: "Enter a description",
      amount: "Enter an amount like 1 500,00",
      day: "Enter a day from 1 to 31",
      endDate: "End date must be on or after the start date",
    },
  });
});
