import { expect, test } from "@playwright/test";
import { mockGameDetails, mockSearchResults } from "./fixtures";

test.describe("Game search", () => {
	test("displays results when a query is present", async ({ page }) => {
		await page.route("/api/games/search*", (route) =>
			route.fulfill({ json: mockSearchResults }),
		);

		await page.goto("/games?query=gta");

		await expect(
			page.getByRole("heading", { name: "Grand Theft Auto V" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Grand Theft Auto IV" }),
		).toBeVisible();
	});

	test("submitting the search form updates the URL", async ({ page }) => {
		await page.route("/api/games/search*", (route) =>
			route.fulfill({ json: mockSearchResults }),
		);

		await page.goto("/games?query=initial");

		// useQuery only fires after React hydrates — waiting for the first request
		// is the most reliable signal that event handlers are attached to the form.
		await page.waitForRequest("**/api/games/search*");

		const input = page.getByPlaceholder("Search for a game...");
		await input.fill("gta");
		await input.press("Enter");

		await expect(page).toHaveURL(/query=gta/);
	});

	test("clicking a game card navigates to the detail page", async ({
		page,
	}) => {
		await page.route("/api/games/search*", (route) =>
			route.fulfill({ json: mockSearchResults }),
		);
		await page.route("/api/games/3498", (route) =>
			route.fulfill({ json: mockGameDetails }),
		);
		await page.route("/api/user-games", (route) =>
			route.fulfill({ json: [] }),
		);

		await page.goto("/games?query=gta");
		await page.getByRole("heading", { name: "Grand Theft Auto V" }).click();

		await expect(page).toHaveURL("/games/3498");
		await expect(
			page.getByRole("heading", { name: "Grand Theft Auto V" }),
		).toBeVisible();
	});

	test("shows an error alert when the search API fails", async ({ page }) => {
		await page.route("/api/games/search*", (route) =>
			route.fulfill({ status: 500 }),
		);

		await page.goto("/games?query=gta");

		// TanStack Query retries 3 times before surfacing the error — allow extra time
		await expect(page.getByRole("alert")).toBeVisible({ timeout: 15_000 });
	});
});
