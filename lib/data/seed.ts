import type {
  DemoData,
  ExpenseCategory,
  MonthlyBudget,
  ScheduledItem,
  Transaction,
} from "@/interfaces/domain";
import { parseIsoDate, previousBusinessDay } from "@/lib/dates/calendar";
import {
  clampToPeriod,
  periodEnd,
  periodOf,
  periodStart,
  shiftPeriod,
} from "@/lib/dates/period";
import { demoDataSchema } from "./schemas";

type Merchant = { merchant: string; description: string };

const BUDGET_TOTAL_CENTS = 2_400_000;

const CATEGORY_BUDGETS: Partial<Record<ExpenseCategory, number>> = {
  groceries: 450_000,
  transport: 250_000,
  entertainment: 120_000,
  shopping: 200_000,
};

const MERCHANTS: Partial<Record<ExpenseCategory, Merchant[]>> = {
  groceries: [
    { merchant: "Checkers", description: "Groceries" },
    { merchant: "Pick n Pay", description: "Groceries" },
    { merchant: "Woolworths Food", description: "Groceries" },
    { merchant: "Checkers", description: "Groceries" },
    { merchant: "Pick n Pay", description: "Groceries" },
  ],
  transport: [
    { merchant: "Engen", description: "Fuel" },
    { merchant: "Uber", description: "Trip" },
    { merchant: "Shell", description: "Fuel" },
    { merchant: "Uber", description: "Trip" },
  ],
  entertainment: [
    { merchant: "Netflix", description: "Streaming subscription" },
    { merchant: "Ster-Kinekor", description: "Movie tickets" },
    { merchant: "Spur", description: "Dinner" },
    { merchant: "Computicket", description: "Concert tickets" },
  ],
  shopping: [
    { merchant: "Takealot", description: "Online order" },
    { merchant: "Mr Price", description: "Clothing" },
    { merchant: "Superbalist", description: "Online order" },
  ],
};

const MONTHLY_PERCENT_OF_BUDGET: Partial<Record<ExpenseCategory, number>>[] = [
  { groceries: 88, transport: 101, entertainment: 60, shopping: 45 },
  { groceries: 92, transport: 78, entertainment: 70, shopping: 64 },
  { groceries: 60, transport: 85, entertainment: 95, shopping: 130 },
];

const CURRENT_MONTH_REFUND_CENTS = 30_000;

const WEIGHTS = [5, 3, 4, 2, 6];

function splitCents(total: number, parts: number): number[] {
  const weights = Array.from(
    { length: parts },
    (_, i) => WEIGHTS[i % WEIGHTS.length],
  );
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);
  const amounts = weights.map((weight) =>
    Math.floor((total * weight) / weightSum),
  );
  amounts[parts - 1] +=
    total - amounts.reduce((sum, amount) => sum + amount, 0);
  return amounts;
}

function spreadDays(count: number, lastDay: number, offset: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.min(
      Math.max(Math.round(((i + 1) * lastDay) / count) - offset, 1),
      lastDay,
    ),
  );
}

function scheduledItems(
  firstPeriod: string,
  currentPeriod: string,
): ScheduledItem[] {
  const startDate = periodStart(firstPeriod);
  const monthly = (day: number) => ({
    kind: "monthly" as const,
    day,
    adjust: "none" as const,
  });

  return [
    {
      id: "salary",
      kind: "income",
      description: "Salary",
      amountCents: 3_200_000,
      rule: { kind: "monthly", day: 25, adjust: "previous_business_day" },
      startDate,
      active: true,
    },
    {
      id: "rent",
      kind: "debit_order",
      description: "Rent",
      amountCents: 950_000,
      category: "housing",
      rule: monthly(1),
      startDate,
      active: true,
    },
    {
      id: "discovery",
      kind: "debit_order",
      description: "Discovery Health",
      amountCents: 245_000,
      category: "health",
      rule: monthly(15),
      startDate,
      active: true,
    },
    {
      id: "vodacom",
      kind: "debit_order",
      description: "Vodacom contract",
      amountCents: 59_900,
      category: "utilities",
      rule: monthly(28),
      startDate,
      active: true,
    },
    {
      id: "virgin-active",
      kind: "debit_order",
      description: "Virgin Active",
      amountCents: 78_900,
      category: "health",
      rule: monthly(31),
      startDate,
      active: true,
    },
    {
      id: "car-service",
      kind: "expense",
      description: "Car service",
      amountCents: 380_000,
      category: "transport",
      rule: { kind: "once", date: clampToPeriod(currentPeriod, 27) },
      startDate: periodStart(currentPeriod),
      active: true,
    },
  ];
}

function scheduledTransactions(
  items: ScheduledItem[],
  period: string,
  today: string,
): Transaction[] {
  const transactions: Transaction[] = [];
  for (const item of items) {
    if (item.rule.kind !== "monthly") continue;
    let date = clampToPeriod(period, item.rule.day);
    if (item.rule.adjust === "previous_business_day") {
      date = previousBusinessDay(date);
    }
    if (date > today || date < item.startDate) continue;

    const id = `${period}-${item.id}`;
    if (item.kind === "income") {
      transactions.push({
        id,
        type: "income",
        category: "salary",
        amountCents: item.amountCents,
        date,
        description: item.description,
      });
    } else {
      transactions.push({
        id,
        type: "expense",
        category: item.category ?? "other",
        amountCents: item.amountCents,
        date,
        description: item.description,
      });
    }
  }
  return transactions;
}

function categoryTransactions(
  period: string,
  monthIndex: number,
  lastDay: number,
): Transaction[] {
  const transactions: Transaction[] = [];
  const percents = MONTHLY_PERCENT_OF_BUDGET[monthIndex];

  const entries = Object.entries(MERCHANTS) as [ExpenseCategory, Merchant[]][];
  for (const [index, [category, merchants]] of entries.entries()) {
    const total =
      ((CATEGORY_BUDGETS[category] ?? 0) * (percents[category] ?? 0)) / 100;
    const amounts = splitCents(total, merchants.length);
    const days = spreadDays(merchants.length, lastDay, index);
    merchants.forEach(({ merchant, description }, i) => {
      transactions.push({
        id: `${period}-${category}-${i + 1}`,
        type: "expense",
        category,
        amountCents: amounts[i],
        date: clampToPeriod(period, days[i]),
        description,
        merchant,
      });
    });
  }

  transactions.push(
    {
      id: `${period}-city-power`,
      type: "expense",
      category: "utilities",
      amountCents: 85_000,
      date: clampToPeriod(period, Math.min(5, lastDay)),
      description: "Prepaid electricity",
      merchant: "City Power",
    },
    {
      id: `${period}-clicks`,
      type: "expense",
      category: "health",
      amountCents: 32_000,
      date: clampToPeriod(period, Math.ceil(lastDay / 2)),
      description: "Pharmacy",
      merchant: "Clicks",
    },
  );

  return transactions;
}

export function createDemoData(today: string): DemoData {
  const current = periodOf(today);
  const periods = [shiftPeriod(current, -2), shiftPeriod(current, -1), current];
  const items = scheduledItems(periods[0], current);
  const todayDay = parseIsoDate(today)!.day;

  const transactions: Transaction[] = [];
  const budgets: MonthlyBudget[] = [];

  periods.forEach((period, monthIndex) => {
    const lastDay =
      period === current ? todayDay : parseIsoDate(periodEnd(period))!.day;

    budgets.push({
      period,
      totalCents: BUDGET_TOTAL_CENTS,
      categories: { ...CATEGORY_BUDGETS },
    });
    transactions.push(
      ...categoryTransactions(period, monthIndex, lastDay),
      ...scheduledTransactions(items, period, today),
    );
  });

  transactions.push(
    {
      id: `${periods[0]}-freelance`,
      type: "income",
      category: "other_income",
      amountCents: 450_000,
      date: clampToPeriod(periods[0], 10),
      description: "Freelance design work",
    },
    {
      id: `${periods[1]}-savings`,
      type: "transfer",
      direction: "out",
      amountCents: 800_000,
      date: clampToPeriod(periods[1], 26),
      description: "Transfer to savings",
    },
    {
      id: `${current}-shopping-refund`,
      type: "refund",
      category: "shopping",
      amountCents: CURRENT_MONTH_REFUND_CENTS,
      date: today,
      description: "Returned item",
      merchant: "Takealot",
      refundOf: `${current}-shopping-1`,
    },
  );

  transactions.sort((a, b) =>
    a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date),
  );

  return demoDataSchema.parse({
    account: {
      name: "Cheque Account",
      maskedNumber: "•••• 4821",
      openingBalanceCents: 650_000,
      openingDate: periodEnd(shiftPeriod(current, -3)),
    },
    transactions,
    budgets,
    scheduledItems: items,
  });
}
