import { expect, test } from "vitest";
import { createDemoData } from "@/lib/data/seed";
import { filterTransactions, parseTransactionFilters } from "./filter";

const { transactions } = createDemoData("2026-10-20");

test("filters by type, category and search, newest first", () => {
  const groceries = filterTransactions(transactions, "2026-10", {
    category: "groceries",
    q: "checkers",
  });
  expect(groceries.length).toBeGreaterThan(0);
  expect(groceries.every((t) => t.description === "Groceries")).toBe(true);
  expect(groceries[0].date >= groceries[groceries.length - 1].date).toBe(true);

  const refunds = filterTransactions(transactions, "2026-10", {
    type: "refund",
  });
  expect(refunds.map((t) => t.type)).toEqual(["refund"]);
});

test("ignores invalid filter values", () => {
  expect(
    parseTransactionFilters({ category: "cars", type: "income", q: " uber " }),
  ).toEqual({ category: undefined, type: "income", q: "uber" });
});
