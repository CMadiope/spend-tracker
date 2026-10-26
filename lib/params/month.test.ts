import { expect, test } from "vitest";
import { resolveMonth } from "./month";

test("falls back to the latest month unless the value is a known month", () => {
  const periods = ["2026-08", "2026-09", "2026-10"];
  expect(resolveMonth("2026-09", periods)).toBe("2026-09");
  expect(resolveMonth(undefined, periods)).toBe("2026-10");
  expect(resolveMonth("september", periods)).toBe("2026-10");
  expect(resolveMonth("2026-11", periods)).toBe("2026-10");
});
