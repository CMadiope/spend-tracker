import { expect, test } from "vitest";
import { resolveMonth } from "./month";

const periods = ["2026-08", "2026-09", "2026-10"];

test.each([
  ["2026-09", "2026-09"],
  [["2026-08", "2026-09"], "2026-08"],
  [undefined, "2026-10"],
  ["2026-13", "2026-10"],
  ["september", "2026-10"],
  ["2026-07", "2026-10"],
  ["2026-11", "2026-10"],
])("%j resolves to %s", (value, expected) => {
  expect(resolveMonth(value, periods)).toBe(expected);
});
