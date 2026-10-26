import { describe, expect, test } from "vitest";
import { isCents, percentOf, sumCents } from "./cents";
import { formatCents, formatSignedCents } from "./format";
import { parseRandsToCents } from "./parse";

const plain = (text: string) => text.replace(/ /g, " ");

describe("formatCents", () => {
  test.each([
    [123456, "R 1 234,56"],
    [0, "R 0,00"],
    [5, "R 0,05"],
    [100000000, "R 1 000 000,00"],
    [-123450, "-R 1 234,50"],
  ])("%i → %s", (cents, expected) => {
    expect(plain(formatCents(cents))).toBe(expected);
  });

  test("uses only non-breaking spaces so server and browser output match", () => {
    expect(formatCents(123456)).toBe("R 1 234,56");
  });
});

describe("formatSignedCents", () => {
  test.each([
    [50000, "+R 500,00"],
    [-50000, "-R 500,00"],
    [0, "R 0,00"],
  ])("%i → %s", (cents, expected) => {
    expect(plain(formatSignedCents(cents))).toBe(expected);
  });
});

describe("parseRandsToCents", () => {
  test.each([
    ["1234.56", 123456],
    ["1234,56", 123456],
    ["R 1 234,56", 123456],
    ["r1234", 123400],
    ["R 1 234,56", 123456],
    ["1,234.56", 123456],
    ["1.234,56", 123456],
    ["1,234", 123400],
    ["1.999", 199900],
    ["1 000 000", 100000000],
    ["12,5", 1250],
    ["0.05", 5],
    ["0", 0],
    ["  450  ", 45000],
  ])("%j → %i", (input, expected) => {
    expect(parseRandsToCents(input)).toBe(expected);
  });

  test.each([
    "",
    "   ",
    "R",
    "-50",
    "abc",
    "12a",
    "1.234.56",
    "1,234.567",
    "1,23,456",
    "1,234.567,89",
    "12.",
    ".5",
    "1.9999",
    "99999999999999999",
  ])("rejects %j", (input) => {
    expect(parseRandsToCents(input)).toBeNull();
  });

  test("round-trips with formatCents", () => {
    for (const cents of [0, 1, 99, 100, 123456, 987654321]) {
      expect(parseRandsToCents(formatCents(cents))).toBe(cents);
    }
  });
});

describe("cents helpers", () => {
  test("isCents accepts only safe non-negative integers", () => {
    expect(isCents(0)).toBe(true);
    expect(isCents(123456)).toBe(true);
    expect(isCents(-1)).toBe(false);
    expect(isCents(1.5)).toBe(false);
    expect(isCents(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    expect(isCents("100")).toBe(false);
  });

  test("sumCents adds exactly where floats would drift", () => {
    expect(sumCents([10, 20])).toBe(30);
    expect(sumCents([])).toBe(0);
  });

  test("sumCents throws past the safe integer range", () => {
    expect(() => sumCents([Number.MAX_SAFE_INTEGER, 1])).toThrow(RangeError);
  });

  test("percentOf rounds for display and guards zero", () => {
    expect(percentOf(8500, 10000)).toBe(85);
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(2, 3)).toBe(67);
    expect(percentOf(11500, 10000)).toBe(115);
    expect(percentOf(100, 0)).toBeNull();
  });
});
