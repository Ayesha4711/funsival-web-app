const { test, expect } = require("@playwright/test");

test("homepage loads", async ({ page }) => {
  await page.goto("https://testing.funsival.com");
  await expect(page).toHaveTitle(/Funsival/i);
});
