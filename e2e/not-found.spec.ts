import { expect, test } from "@playwright/test";

test.describe("404 page", () => {
	test("renders a 404 heading for unknown routes", async ({ page }) => {
		await page.goto("/this-page-does-not-exist");
		await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
		await expect(page.getByText("Page not found")).toBeVisible();
	});

	test('"Go home" link navigates back to the home page', async ({ page }) => {
		await page.goto("/this-page-does-not-exist");
		await page.getByRole("link", { name: /Go home/i }).click();
		await expect(page).toHaveURL("/");
	});
});
