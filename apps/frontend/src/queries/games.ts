import type { GameSearchResult } from "@backlogify/types";
import { queryOptions } from "@tanstack/react-query";

export const gamesQueryOptions = (searchTerm: string) =>
	queryOptions({
		queryKey: ["games", searchTerm],
		queryFn: async (): Promise<GameSearchResult[]> => {
			const res = await fetch(
				`/api/games/search?query=${encodeURIComponent(searchTerm)}`,
			);
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
		},
		enabled: !!searchTerm,
	});
