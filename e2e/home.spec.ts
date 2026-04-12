import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders the hero heading", async ({ page }) => {
		await expect(
			page.getByRole("heading", { name: "Backlogify" }),
		).toBeVisible();
	});

	test("Search Games link navigates to /games", async ({ page }) => {
		await page.getByRole("link", { name: /Search Games/i }).click();
		await expect(page).toHaveURL("/games");
	});

	test("shows all three feature cards", async ({ page }) => {
		// Scope to card-title elements to avoid matching nav/button text with the same label
		const cardTitle = (name: string) =>
			page.locator("[data-slot='card-title']", { hasText: name });
		await expect(cardTitle("Search Games")).toBeVisible();
		await expect(cardTitle("Build Your Backlog")).toBeVisible();
		await expect(cardTitle("Track Progress")).toBeVisible();
	});
});
