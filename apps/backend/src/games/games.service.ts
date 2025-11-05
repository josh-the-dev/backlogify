import type { GameDetails, GameSearchResult } from "@backlogify/types";
import { Injectable, Logger } from "@nestjs/common";
import { RawgService } from "../rawg/rawg.service";

@Injectable()
export class GamesService {
	private readonly logger = new Logger(GamesService.name);

	constructor(private readonly rawgService: RawgService) {}

	async search(query: string): Promise<GameSearchResult[]> {
		try {
			this.logger.log(`Searching games for query: "${query}"`);

			const rawgResponse = await this.rawgService.searchGames(query);

			return rawgResponse.results.map((game) => ({
				id: game.id,
				name: game.name,
				coverUrl: game.background_image || null,
			}));
		} catch (error) {
			this.logger.error(
				`Failed to search games: ${error.message}`,
				error.stack,
			);
			throw error;
		}
	}

	async getGameDetails(id: string): Promise<GameDetails> {
		try {
			this.logger.log(`Fetching game details for ID: "${id}"`);

			const game = await this.rawgService.getGameDetails(id);
			return {
				id: game.id,
				name: game.name,
				description: game.description,
				releaseDate: game.released,
				coverUrl: game.background_image || null,
				genres: game.genres?.map((g: { name: string }) => g.name) ?? [],
				platforms:
					game.platforms?.map(
						(p: { platform?: { name: string }; name?: string }) =>
							p.platform?.name ?? p.name ?? "Unknown",
					) ?? [],
			};
		} catch (error) {
			this.logger.error(
				`Failed to fetch game details: ${error.message}`,
				error.stack,
			);
			throw error;
		}
	}
}
