export type Game = {
	id: number;
	name: string;
	cover?: {
		id: number;
		url: string;
	};
	first_release_date?: number;
	platforms?: { name: string }[];
};