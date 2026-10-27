import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import { deriveAlerts, visibleAlerts } from "@/lib/alerts/alerts";
import { AlertList } from "./alert-list";

test("lists alerts with a link to the budget and read/dismiss actions", () => {
  const alerts = visibleAlerts(
    deriveAlerts(
      {
        period: "2026-10",
        totalCents: 1_000_000,
        categories: { groceries: 10_000 },
      },
      [
        {
          id: "a",
          type: "expense",
          category: "groceries",
          amountCents: 9_500,
          date: "2026-10-05",
          description: "Groceries",
        },
      ],
      "2026-10",
    ),
    { readKeys: [], dismissedKeys: [], firstSeenAt: {} },
  );
  const onRead = vi.fn();
  const onDismiss = vi.fn();
  render(<AlertList alerts={alerts} onRead={onRead} onDismiss={onDismiss} />);

  expect(
    screen.getByRole("link", { name: "Unread: Groceries" }),
  ).toHaveAttribute("href", "/budgets?month=2026-10#category-groceries");
  expect(screen.getByText("Near limit (90%)")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Mark read, Groceries" }));
  fireEvent.click(screen.getByRole("button", { name: "Dismiss, Groceries" }));
  expect(onRead).toHaveBeenCalledWith("2026-10:category:groceries:90");
  expect(onDismiss).toHaveBeenCalledWith("2026-10:category:groceries:90");
});
