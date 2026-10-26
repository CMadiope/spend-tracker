import { periodSchema } from "@/lib/data/schemas";

export function resolveMonth(
  value: string | string[] | undefined,
  periods: readonly string[],
): string {
  const parsed = periodSchema.safeParse(
    Array.isArray(value) ? value[0] : value,
  );
  if (parsed.success && periods.includes(parsed.data)) return parsed.data;
  return periods[periods.length - 1];
}
