import type { GameDetails, GameSearchResult } from "@backlogify/types";

export const mockSearchResults: GameSearchResult[] = [
	{ id: 3498, name: "Grand Theft Auto V", coverUrl: null },
	{ id: 12020, name: "Grand Theft Auto IV", coverUrl: null },
];

export const mockGameDetails: GameDetails = {
	id: 3498,
	name: "Grand Theft Auto V",
	description: "<p>An open world action-adventure game set in Los Santos.</p>",
	releaseDate: "2013-09-17",
	coverUrl: null,
	genres: ["Action", "Adventure"],
	platforms: ["PC", "PlayStation 4", "Xbox One"],
};
