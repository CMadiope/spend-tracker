import { expect, test } from "vitest";
import {
  STORAGE_KEY,
  emptyState,
  loadState,
  saveState,
  type StoredState,
} from "./storage";

function memoryStorage(initial?: string) {
  const items = new Map<string, string>();
  if (initial !== undefined) items.set(STORAGE_KEY, initial);
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
    removeItem: (key: string) => void items.delete(key),
  };
}

test("round-trips saved edits", () => {
  const storage = memoryStorage();
  const state: StoredState = {
    ...emptyState,
    budgets: [
      {
        period: "2026-10",
        totalCents: 100_000,
        categories: { groceries: 40_000 },
      },
    ],
  };
  expect(saveState(storage, state)).toBe(true);
  expect(loadState(storage)).toEqual(state);
});

test("falls back to seed data when storage is unusable", () => {
  const throwing = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("QuotaExceededError");
    },
    removeItem: () => {},
  };

  expect(loadState(memoryStorage("{not json"))).toEqual(emptyState);
  expect(
    loadState(memoryStorage(JSON.stringify({ ...emptyState, version: 0 }))),
  ).toEqual(emptyState);
  expect(loadState(throwing)).toEqual(emptyState);
  expect(loadState(undefined)).toEqual(emptyState);
  expect(saveState(throwing, emptyState)).toBe(false);
});
