// Game types
export interface GameSearchResult {
	id: number;
	name: string;
	coverUrl: string | null;
	releaseDate: string | null;
	metacritic: number | null;
}

export interface GameDetails {
	id: number;
	name: string;
	description: string;
	releaseDate: string | null;
	coverUrl: string | null;
	genres: string[];
	platforms: string[];
}

export type GameStatus = "backlog" | "playing" | "played" | "abandoned";

// User game types
export interface UserGame {
	id: string;
	userId: string;
	externalServiceId: string;
	name: string;
	coverUrl?: string | null;
	status: GameStatus;
	addedAt: Date;
	finishedAt?: Date | null;
	note?: string | null;
}

// Backlog types
export interface BacklogItem {
	id: string;
	externalServiceId: number;
	name: string;
	coverUrl?: string | null;
	addedAt: Date;
}

export interface Backlog {
	id: string;
	name: string;
	items: BacklogItem[];
}

// API error type
export interface ApiError {
	statusCode: number;
	message: string;
	error?: string;
}