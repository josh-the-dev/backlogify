import type { UserGame } from "@backlogify/types";
import { describe, expect, it } from "vitest";
import { computeLibraryStats } from "./library-stats";

const NOW = new Date("2026-06-12T12:00:00.000Z");

function game(overrides: Partial<UserGame>): UserGame {
	return {
		id: "id",
		userId: "user-1",
		externalServiceId: "ext-1",
		name: "Some Game",
		coverUrl: null,
		status: "backlog",
		addedAt: new Date("2026-01-01T00:00:00.000Z"),
		finishedAt: null,
		note: null,
		pinnedAt: null,
		...overrides,
	};
}

describe("computeLibraryStats", () => {
	it("returns zeros and no oldest entry for an empty library", () => {
		const stats = computeLibraryStats([], NOW);

		expect(stats).toEqual({
			total: 0,
			played: 0,
			completionRate: 0,
			finishedThisYear: 0,
			oldestBacklog: null,
		});
	});

	it("computes completion rate as a rounded whole percent", () => {
		const stats = computeLibraryStats(
			[
				game({ status: "played" }),
				game({ status: "backlog" }),
				game({ status: "abandoned" }),
			],
			NOW,
		);

		expect(stats.total).toBe(3);
		expect(stats.played).toBe(1);
		expect(stats.completionRate).toBe(33);
	});

	it("counts only games finished in the current year", () => {
		const stats = computeLibraryStats(
			[
				game({ status: "played", finishedAt: new Date("2026-02-10") }),
				game({ status: "played", finishedAt: new Date("2025-12-31") }),
				game({ status: "backlog", finishedAt: null }),
			],
			NOW,
		);

		expect(stats.finishedThisYear).toBe(1);
	});

	it("finds the oldest backlog entry, ignoring other statuses", () => {
		const stats = computeLibraryStats(
			[
				game({ name: "Newer Backlog", addedAt: new Date("2026-03-01") }),
				game({ name: "Oldest Backlog", addedAt: new Date("2025-04-15") }),
				game({
					name: "Ancient But Playing",
					status: "playing",
					addedAt: new Date("2024-01-01"),
				}),
			],
			NOW,
		);

		expect(stats.oldestBacklog?.name).toBe("Oldest Backlog");
		expect(stats.oldestBacklog?.addedAt).toEqual(new Date("2025-04-15"));
	});

	it("returns no oldest entry when nothing is in the backlog", () => {
		const stats = computeLibraryStats(
			[game({ status: "playing" }), game({ status: "played" })],
			NOW,
		);

		expect(stats.oldestBacklog).toBeNull();
	});

	it("handles date fields that arrive as ISO strings over JSON", () => {
		const stats = computeLibraryStats(
			[
				game({
					status: "played",
					addedAt: "2025-04-15T00:00:00.000Z" as unknown as Date,
					finishedAt: "2026-02-10T00:00:00.000Z" as unknown as Date,
				}),
				game({
					addedAt: "2024-11-02T00:00:00.000Z" as unknown as Date,
				}),
			],
			NOW,
		);

		expect(stats.finishedThisYear).toBe(1);
		expect(stats.oldestBacklog?.addedAt).toEqual(
			new Date("2024-11-02T00:00:00.000Z"),
		);
	});
});
