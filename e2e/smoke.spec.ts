import { test, expect } from "@playwright/test";

test("root redirects to a locale and shows the sidebar shell", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/[A-Za-z-]+$/);
  await expect(page.getByText("ETIM").first()).toBeVisible();
});

test("classes list renders rows and opens a class detail", async ({ page }) => {
  await page.goto("/EN/classes");
  const firstClass = page.locator('a[href^="/EN/classes/EC"]').first();
  await expect(firstClass).toBeVisible();
  await firstClass.click();
  await expect(page).toHaveURL(/\/EN\/classes\/EC\d+/);
});

test("features list filters by type via the URL", async ({ page }) => {
  await page.goto("/EN/features?type=Logical");
  await expect(page.locator('a[href^="/EN/features/EF"]').first()).toBeVisible();
});

test("global search returns grouped results", async ({ page }) => {
  await page.goto("/EN/search?q=cable");
  await expect(page.getByText(/Results for/i)).toBeVisible();
  await expect(page.locator('a[href^="/EN/classes/EC"]').first()).toBeVisible();
});

test("UI is localized for de-DE", async ({ page }) => {
  await page.goto("/de-DE/classes");
  // German column header / nav label
  await expect(page.getByText("Klassen").first()).toBeVisible();
});

test("search box reflects the active query", async ({ page }) => {
  await page.goto("/EN/search?q=cable");
  await expect(page.getByRole("searchbox")).toHaveValue("cable");
});

test("switching language preserves filters", async ({ page }) => {
  await page.goto("/EN/classes?cc=Changed");
  // Open the language menu and pick German.
  await page.getByRole("button", { name: /language/i }).click();
  await page.getByRole("menuitem", { name: /Deutsch/i }).click();
  await expect(page).toHaveURL(/\/de-DE\/classes\?.*cc=Changed/);
});
