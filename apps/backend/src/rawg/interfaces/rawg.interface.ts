export interface RawgGame {
	id: number;
	name: string;
	background_image: string | null;
}

export interface RawgSearchResponse {
	results: RawgGame[];
}
