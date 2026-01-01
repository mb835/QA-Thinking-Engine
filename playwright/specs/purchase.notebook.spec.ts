import { test, expect } from "@playwright/test";

test.describe("Purchase notebook – happy path", () => {
  test("User can add notebook to cart", async ({ page }) => {
    await page.goto("/");

    await page.fill("input[name='searchText']", "notebook");
    await page.press("input[name='searchText']", "Enter");

    await page.click('[data-testid="productCard"] >> nth=0');
    await page.click('[data-testid="addToCart"]');

    await expect(page.locator("text=V košíku")).toBeVisible();
  });
});
