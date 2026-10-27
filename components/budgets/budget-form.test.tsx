import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { BudgetForm } from "./budget-form";

test("shows inline errors, warns on over-allocation and saves valid budgets", () => {
  const onSave = vi.fn();
  render(
    <BudgetForm
      period="2026-10"
      budget={{ period: "2026-10", totalCents: 100_000, categories: {} }}
      onSave={onSave}
      onCancel={() => {}}
    />,
  );
  const total = screen.getByLabelText("Overall monthly budget (R)");
  const groceries = screen.getByLabelText("Groceries");

  fireEvent.change(total, { target: { value: "abc" } });
  fireEvent.click(screen.getByRole("button", { name: "Save budgets" }));
  expect(total).toHaveAttribute("aria-invalid", "true");
  expect(total).toHaveFocus();
  expect(onSave).not.toHaveBeenCalled();

  fireEvent.change(total, { target: { value: "1000" } });
  fireEvent.change(groceries, { target: { value: "1500" } });
  expect(screen.getByRole("status")).toHaveTextContent("You can still save");

  fireEvent.click(screen.getByRole("button", { name: "Save budgets" }));
  expect(onSave).toHaveBeenCalledWith({
    period: "2026-10",
    totalCents: 100_000,
    categories: { groceries: 150_000 },
  });
});
