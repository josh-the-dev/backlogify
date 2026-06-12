import type { UserGame } from "@backlogify/types";

export interface LibraryStats {
	total: number;
	played: number;
	/** Whole percent, 0-100 */
	completionRate: number;
	finishedThisYear: number;
	oldestBacklog: { name: string; addedAt: Date } | null;
}

/**
 * Aggregates the library for the stats strip on My Games. Date fields
 * arrive as ISO strings over JSON despite the UserGame type, so they are
 * re-wrapped in `new Date()` before comparing.
 */
export function computeLibraryStats(
	games: UserGame[],
	now: Date = new Date(),
): LibraryStats {
	const total = games.length;
	const played = games.filter((g) => g.status === "played").length;

	const finishedThisYear = games.filter(
		(g) =>
			g.finishedAt &&
			new Date(g.finishedAt).getFullYear() === now.getFullYear(),
	).length;

	let oldestBacklog: LibraryStats["oldestBacklog"] = null;
	for (const game of games) {
		if (game.status !== "backlog") continue;
		const addedAt = new Date(game.addedAt);
		if (!oldestBacklog || addedAt < oldestBacklog.addedAt) {
			oldestBacklog = { name: game.name, addedAt };
		}
	}

	return {
		total,
		played,
		completionRate: total === 0 ? 0 : Math.round((played / total) * 100),
		finishedThisYear,
		oldestBacklog,
	};
}
