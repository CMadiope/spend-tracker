"use client";

import { useSyncExternalStore } from "react";
import type { MonthlyBudget, ScheduledItem } from "@/interfaces/domain";
import {
  STORAGE_KEY,
  type StoredState,
  clearState,
  emptyState,
  loadState,
  saveState,
} from "./storage";

const listeners = new Set<() => void>();
let state: StoredState | undefined;

function browserStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function getSnapshot(): StoredState {
  state ??= loadState(browserStorage());
  return state;
}

function getServerSnapshot(): null {
  return null;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    state = loadState(browserStorage());
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function update(change: (current: StoredState) => StoredState): void {
  state = change(getSnapshot());
  saveState(browserStorage(), state);
  for (const listener of listeners) listener();
}

export function useStoredState(): StoredState | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function saveBudget(budget: MonthlyBudget): void {
  update((current) => ({
    ...current,
    budgets: [
      ...current.budgets.filter((b) => b.period !== budget.period),
      budget,
    ],
  }));
}

export function saveScheduledItems(items: ScheduledItem[]): void {
  update((current) => ({ ...current, scheduledItems: items }));
}

export function markAlertsRead(keys: string[]): void {
  update((current) => ({
    ...current,
    alerts: {
      ...current.alerts,
      readKeys: [...new Set([...current.alerts.readKeys, ...keys])],
    },
  }));
}

export function dismissAlert(key: string): void {
  update((current) => ({
    ...current,
    alerts: {
      ...current.alerts,
      dismissedKeys: [...new Set([...current.alerts.dismissedKeys, key])],
    },
  }));
}

export function recordFirstSeen(keys: string[], seenAt: string): void {
  const current = getSnapshot();
  const unseen = keys.filter((key) => !(key in current.alerts.firstSeenAt));
  if (unseen.length === 0) return;
  update((s) => ({
    ...s,
    alerts: {
      ...s.alerts,
      firstSeenAt: {
        ...s.alerts.firstSeenAt,
        ...Object.fromEntries(unseen.map((key) => [key, seenAt])),
      },
    },
  }));
}

export function resetStoredState(): void {
  clearState(browserStorage());
  state = emptyState;
  for (const listener of listeners) listener();
}
