import type { DemoData } from "@/interfaces/domain";
import { createDemoData } from "./seed";

let cached: { today: string; data: DemoData } | undefined;

export function getDemoData(today: string): DemoData {
  if (cached?.today !== today) {
    cached = { today, data: createDemoData(today) };
  }
  return cached.data;
}

export function availablePeriods(data: DemoData): string[] {
  return data.budgets.map((budget) => budget.period).sort();
}
