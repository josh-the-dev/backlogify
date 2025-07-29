import { apiClient } from "./client";

// TODO: Get this from the backend generated types
export interface Game {
	id: string;
	name: string;
	coverUrl?: string | null;
}

export async function searchGames(query: string) {
	return apiClient
		.get("games/search", { searchParams: { query: query } })
		.json<Game[]>();
}
