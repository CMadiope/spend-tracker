import { expect, test } from "vitest";
import { percentOf, sumCents } from "./cents";
import { formatCents, formatSignedCents } from "./format";
import { parseRandsToCents } from "./parse";

test("formats ZAR with non-breaking spaces", () => {
  expect(formatCents(123456)).toBe("R 1 234,56");
  expect(formatSignedCents(50000)).toBe("+R 500,00");
});

test("parses typed amounts into cents", () => {
  expect(parseRandsToCents("R 1 234,56")).toBe(123456);
  expect(parseRandsToCents("1,234.56")).toBe(123456);
  expect(parseRandsToCents("12,5")).toBe(1250);
  expect(parseRandsToCents("-50")).toBeNull();
  expect(parseRandsToCents("1.234.56")).toBeNull();
  expect(parseRandsToCents(formatCents(987654321))).toBe(987654321);
});

test("cents arithmetic stays exact", () => {
  expect(sumCents([10, 20])).toBe(30);
  expect(percentOf(8500, 10000)).toBe(85);
  expect(percentOf(100, 0)).toBeNull();
});
