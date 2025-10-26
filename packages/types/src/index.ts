// TODO: Clean up file

export interface GameSearchResult {
	id: number;
	name: string;
	coverUrl: string | null;
}

export type GameStatus = "backlog" | "playing" | "played";