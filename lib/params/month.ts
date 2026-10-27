import { periodSchema } from "@/lib/data/schemas";

export function resolveMonth(
  value: string | string[] | undefined,
  periods: readonly string[],
  fallback: string = periods[periods.length - 1],
): string {
  const parsed = periodSchema.safeParse(
    Array.isArray(value) ? value[0] : value,
  );
  if (parsed.success && periods.includes(parsed.data)) return parsed.data;
  return fallback;
}
