// TODO: Clean up file

export interface GameSearchResult {
	id: number;
	name: string;
	coverUrl: string | null;
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


export type GameStatus = "backlog" | "playing" | "played";