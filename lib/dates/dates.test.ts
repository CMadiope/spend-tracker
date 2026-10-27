import { describe, expect, test } from "vitest";
import { isIsoDate, previousBusinessDay } from "./calendar";
import { currentPeriod, today } from "./clock";
import { clampToPeriod, isInPeriod, nextPeriod, periodEnd } from "./period";

describe("period", () => {
  test("includes the first and last day only", () => {
    expect(isInPeriod("2026-10-01", "2026-10")).toBe(true);
    expect(isInPeriod("2026-10-31", "2026-10")).toBe(true);
    expect(isInPeriod("2026-09-30", "2026-10")).toBe(false);
    expect(isInPeriod("2026-11-01", "2026-10")).toBe(false);
  });

  test("rolls over the year", () => {
    expect(nextPeriod("2026-12")).toBe("2027-01");
  });

  test("handles leap-year February", () => {
    expect(periodEnd("2026-02")).toBe("2026-02-28");
    expect(periodEnd("2028-02")).toBe("2028-02-29");
    expect(isIsoDate("2026-02-29")).toBe(false);
  });

  test.each([
    ["2026-11", 31, "2026-11-30"],
    ["2026-02", 30, "2026-02-28"],
    ["2028-02", 31, "2028-02-29"],
    ["2026-10", 31, "2026-10-31"],
  ])("clamps %s day %i to %s", (period, day, expected) => {
    expect(clampToPeriod(period, day)).toBe(expected);
  });
});

test("moves a weekend payday back to Friday", () => {
  expect(previousBusinessDay("2026-10-25")).toBe("2026-10-23");
  expect(previousBusinessDay("2026-10-23")).toBe("2026-10-23");
});

test("uses the Johannesburg date, not UTC", () => {
  expect(today(new Date("2026-10-31T21:59:59Z"))).toBe("2026-10-31");
  expect(currentPeriod(new Date("2026-10-31T22:00:00Z"))).toBe("2026-11");
});
