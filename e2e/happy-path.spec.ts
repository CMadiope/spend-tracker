import { expect, type Page, test } from "@playwright/test";

async function unreadCount(page: Page): Promise<number> {
  const bell = page.getByRole("button", { name: /^Alerts,/ });
  await expect(bell).toBeVisible();
  const label = (await bell.getAttribute("aria-label")) ?? "";
  return Number(label.match(/(\d+) unread/)?.[1] ?? 0);
}

test("overview, budgets, alerts and forecast happy path", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Key figures" }).getByText("Net expenses"),
  ).toBeVisible();

  const monthNav = page.getByRole("navigation", { name: "Month" });
  const month = monthNav.locator("[aria-current=date]");
  const currentMonth = (await month.textContent())!;
  await monthNav.getByRole("link", { name: /^Previous month/ }).click();
  await expect(page).toHaveURL(/\?month=\d{4}-\d{2}$/);
  await expect(month).not.toHaveText(currentMonth);

  await page.goto("/budgets");
  const groceries = page.locator("#category-groceries");
  await expect(groceries.getByText("On track")).toBeVisible();
  const before = await unreadCount(page);

  await page.getByRole("button", { name: "Edit budgets" }).click();
  await page.getByLabel("Groceries", { exact: true }).fill("2 000");
  await page.getByRole("button", { name: "Save budgets" }).click();
  await expect(groceries.getByText("Over budget")).toBeVisible();
  await expect.poll(() => unreadCount(page)).toBe(before + 1);

  await page.reload();
  await expect(groceries.getByText("Over budget")).toBeVisible();

  await page.getByRole("button", { name: /^Alerts,/ }).click();
  const panel = page.getByLabel("Budget alerts");
  await expect(panel).toBeVisible();
  await panel.getByRole("button", { name: "Mark read, Groceries" }).click();
  await expect.poll(() => unreadCount(page)).toBe(before);
  await page.keyboard.press("Escape");

  await page.goto("/forecast");
  await monthNav.getByRole("link", { name: /^Next month/ }).click();
  await expect(page).toHaveURL(/\/forecast\?month=/);
  const estimate = page
    .getByRole("term")
    .filter({ hasText: "Month-end estimate" })
    .locator("+ dd");
  const estimateBefore = (await estimate.textContent())!;

  await page.getByRole("button", { name: "Add item" }).click();
  await page.getByLabel("Description").fill("Car insurance");
  await page.getByLabel("Amount (R)").fill("1 200");
  await page.getByLabel("Day of month").fill("15");
  await page.getByRole("button", { name: "Save item" }).click();

  await expect(
    page.getByRole("listitem").filter({ hasText: "Car insurance" }),
  ).toBeVisible();
  await expect(estimate).not.toHaveText(estimateBefore);
});
