import { z } from "zod";
import { monthlyBudgetSchema, scheduledItemSchema } from "@/lib/data/schemas";

export const STORAGE_KEY = "spend-tracker";
export const STORAGE_VERSION = 1;

export const storedStateSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  budgets: z.array(monthlyBudgetSchema),
  scheduledItems: z.array(scheduledItemSchema).nullable(),
  alerts: z.object({
    readKeys: z.array(z.string()),
    dismissedKeys: z.array(z.string()),
    firstSeenAt: z.record(z.string(), z.string()),
  }),
});

export type StoredState = z.infer<typeof storedStateSchema>;

export const emptyState: StoredState = {
  version: STORAGE_VERSION,
  budgets: [],
  scheduledItems: null,
  alerts: { readKeys: [], dismissedKeys: [], firstSeenAt: {} },
};

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function loadState(storage: KeyValueStorage | undefined): StoredState {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = storedStateSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : emptyState;
  } catch {
    return emptyState;
  }
}

export function saveState(
  storage: KeyValueStorage | undefined,
  state: StoredState,
): boolean {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
    return storage !== undefined;
  } catch {
    return false;
  }
}

export function clearState(storage: KeyValueStorage | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
  } catch {}
}
