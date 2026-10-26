import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import OverviewPage from "./page";

test("renders the overview heading", () => {
  render(<OverviewPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Overview" }),
  ).toBeInTheDocument();
});
