import {
	infiniteQueryOptions,
	keepPreviousData,
	queryOptions,
} from "@tanstack/react-query";
import {
	getGameDetails,
	getGameExtras,
	getPopularGames,
	searchGames,
} from "../server/games";

/* Must match page_size in the backend RawgService.searchGames */
export const SEARCH_PAGE_SIZE = 20;

export const gamesSearchQueryOptions = (searchTerm: string) =>
	infiniteQueryOptions({
		queryKey: ["games", "search", searchTerm],
		queryFn: ({ pageParam }) =>
			searchGames({ data: { query: searchTerm, page: pageParam } }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, _allPages, lastPageParam) =>
			lastPage.length === SEARCH_PAGE_SIZE ? lastPageParam + 1 : undefined,
		enabled: !!searchTerm,
		placeholderData: keepPreviousData,
	});

export const popularGamesQueryOptions = () =>
	infiniteQueryOptions({
		queryKey: ["games", "popular"],
		queryFn: ({ pageParam }) => getPopularGames({ data: { page: pageParam } }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, _allPages, lastPageParam) =>
			lastPage.length === SEARCH_PAGE_SIZE ? lastPageParam + 1 : undefined,
		staleTime: 1000 * 60 * 30,
	});

export const gameDetailsQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["games", "details", id],
		queryFn: () => getGameDetails({ data: { id } }),
		enabled: !!id,
	});

export const gameExtrasQueryOptions = (id: string) =>
	queryOptions({
		queryKey: ["games", "extras", id],
		queryFn: () => getGameExtras({ data: { id } }),
		enabled: !!id,
		staleTime: 1000 * 60 * 30,
	});
