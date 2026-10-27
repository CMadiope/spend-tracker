import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const path of ["/", "/transactions", "/budgets", "/forecast"]) {
  test(`${path} has no axe violations or horizontal scroll`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.getByRole("button", { name: /^Alerts,/ })).toBeVisible();
    await expect(
      page.locator("main [aria-hidden].h-36, main [aria-hidden].h-22"),
    ).toHaveCount(0);

    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations).toEqual([]);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  });
}
