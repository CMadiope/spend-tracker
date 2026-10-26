export function isCents(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

export function sumCents(values: readonly number[]): number {
  let total = 0;
  for (const value of values) {
    total += value;
  }
  if (!Number.isSafeInteger(total)) {
    throw new RangeError("Cents total is outside the safe integer range");
  }
  return total;
}

export function percentOf(part: number, whole: number): number | null {
  if (whole === 0) return null;
  return Math.round((part * 100) / whole);
}
