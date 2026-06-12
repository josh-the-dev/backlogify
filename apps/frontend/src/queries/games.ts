import type { GameDetails, GameSearchResult } from "@backlogify/types";
import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";

/* Must match page_size in the backend RawgService.searchGames */
export const SEARCH_PAGE_SIZE = 20;

export const gamesSearchQueryOptions = (searchTerm: string) =>
	infiniteQueryOptions({
		queryKey: ["games", "search", searchTerm],
		queryFn: async ({ pageParam }): Promise<GameSearchResult[]> => {
			const res = await fetch(
				`/api/games/search?query=${encodeURIComponent(searchTerm)}&page=${pageParam}`,
			);
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, _allPages, lastPageParam) =>
			lastPage.length === SEARCH_PAGE_SIZE ? lastPageParam + 1 : undefined,
		enabled: !!searchTerm,
		placeholderData: keepPreviousData,
	});

export const popularGamesQueryOptions = () =>
	infiniteQueryOptions({
		queryKey: ["games", "popular"],
		queryFn: async ({ pageParam }): Promise<GameSearchResult[]> => {
			const res = await fetch(`/api/games/popular?page=${pageParam}`);
			if (!res.ok) throw new Error(`Request failed: ${res.status}`);
			return res.json();
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, _allPages, lastPageParam) =>
			lastPage.length === SEARCH_PAGE_SIZE ? lastPageParam + 1 : undefined,
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
