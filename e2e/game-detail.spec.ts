import { expect, test } from "@playwright/test";
import { mockGameDetails } from "./fixtures";

test.describe("Game detail page", () => {
	test.beforeEach(async ({ page }) => {
		await page.route("/api/games/3498", (route) =>
			route.fulfill({ json: mockGameDetails }),
		);
		// AddToBacklogButton fetches the library on mount; return empty for unauthenticated tests
		await page.route("/api/user-games", (route) =>
			route.fulfill({ json: [] }),
		);

		await page.goto("/games/3498");
	});

	test("renders the game title", async ({ page }) => {
		// CardTitle renders as a div (not a heading element), so we scope via data-slot
		await expect(
			page.locator("[data-slot='card-title']"),
		).toHaveText("Grand Theft Auto V");
	});

	test("shows the release date", async ({ page }) => {
		await expect(page.getByText("17 Sep 2013")).toBeVisible();
	});

	test("shows genre and platform badges", async ({ page }) => {
		// Scope to badge elements to avoid matching substring in the description text
		const badge = (name: string) =>
			page.locator("[data-slot='badge']").filter({ hasText: name });
		await expect(badge("Action")).toBeVisible();
		await expect(badge("Adventure")).toBeVisible();
		await expect(badge("PC")).toBeVisible();
		await expect(badge("PlayStation 4")).toBeVisible();
	});

	test("shows an Add to Backlog button for signed-out users", async ({
		page,
	}) => {
		await expect(
			page.getByRole("button", { name: /Add to Backlog/i }),
		).toBeVisible();
	});
});
