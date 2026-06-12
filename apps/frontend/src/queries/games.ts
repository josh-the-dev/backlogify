import type { GameDetails, GameSearchResult } from "@backlogify/types";
import { keepPreviousData, queryOptions } from "@tanstack/react-query";

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
		placeholderData: keepPreviousData,
	});

export const popularGamesQueryOptions = () =>
	queryOptions({
		queryKey: ["games", "popular"],
		queryFn: async (): Promise<GameSearchResult[]> => {
			const res = await fetch("/api/games/popular");
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
		},
		staleTime: 1000 * 60 * 30,
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
