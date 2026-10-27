import { render, screen, within } from "@testing-library/react";
import { expect, test } from "vitest";
import { Timeline } from "./timeline";

test("shows each event with its running balance, highlighting negatives", () => {
  render(
    <Timeline
      rows={[
        {
          id: "rent:2026-10-22",
          itemId: "rent",
          date: "2026-10-22",
          description: "Rent",
          kind: "debit_order",
          amountCents: 300_000,
          signedCents: -300_000,
          balanceAfterCents: -200_000,
        },
        {
          id: "salary:2026-10-23",
          itemId: "salary",
          date: "2026-10-23",
          description: "Salary",
          kind: "income",
          amountCents: 1_000_000,
          signedCents: 1_000_000,
          balanceAfterCents: 800_000,
        },
      ]}
    />,
  );
  const [, rent, salary] = screen.getAllByRole("row");

  expect(within(rent).getByRole("rowheader")).toHaveTextContent(
    "RentDebit order",
  );
  expect(within(rent).getAllByRole("cell").at(-1)).toHaveClass("text-danger");
  expect(within(salary).getAllByRole("cell").at(-1)?.textContent).toBe(
    "R 8 000,00",
  );
});
