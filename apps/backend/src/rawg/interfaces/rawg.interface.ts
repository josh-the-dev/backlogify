export interface RawgGame {
	id: number;
	name: string;
	background_image: string | null;
	released?: string | null;
	metacritic?: number | null;
}

export interface RawgSearchResponse {
	results: RawgGame[];
}

export interface RawgScreenshot {
	id: number;
	image: string;
	is_deleted?: boolean;
}

export interface RawgScreenshotsResponse {
	results: RawgScreenshot[];
}

export interface RawgStoreLink {
	id: number;
	store_id: number;
	url: string;
}

export interface RawgStoresResponse {
	results: RawgStoreLink[];
}

export interface RawgGameDetails {
	id: number;
	name: string;
	description: string;
	released: string | null;
	background_image: string | null;
	genres: {
		id: number;
		name: string;
		slug: string;
		games_count: number;
		image_background: string;
	}[];
	platforms: {
		platform: {
			id: number;
			name: string;
			slug: string;
			image: string | null;
			year_end: number | null;
			year_start: number | null;
			games_count: number;
			image_background: string;
		};
		released_at?: string;
		requirements?: Record<string, string>;
	}[];
}
