import type { GameDetails, GameSearchResult } from "@backlogify/types";
import { queryOptions } from "@tanstack/react-query";

export const gamesQueryOptions = (searchTerm: string) =>
	queryOptions({
		queryKey: ["games", searchTerm],
		queryFn: async (): Promise<GameSearchResult[]> => {
			console.log("eh");
			const res = await fetch(
				`/api/games/search?query=${encodeURIComponent(searchTerm)}`,
			);
			console.log(res);
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
		},
		enabled: !!searchTerm,
	});

export const gameDetailsQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["games", "details", id],
		queryFn: async (): Promise<GameDetails> => {
			const res = await fetch(`/api/games/${id}`);
			if (!res.ok) throw new Error("Failed to fetch game details");
			return res.json();
		},
		enabled: !!id,
	});
