import { expect, test } from "@playwright/test";

test.describe("My Games page", () => {
	test("redirects unauthenticated users to sign-in", async ({ page }) => {
		await page.goto("/my-games");
		// The server-side auth check redirects with a `redirect` search param
		await expect(page).toHaveURL(/\/sign-in/);
	});
});
