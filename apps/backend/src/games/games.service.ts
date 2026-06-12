import { Injectable, Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import type { RawgGame } from "../rawg/interfaces/rawg.interface";
import { RawgService } from "../rawg/rawg.service";
import { GameDetailsResponseDto } from "./dtos/game-details.response.dto";
import { GameSearchResultResponseDto } from "./dtos/game-search-result.response.dto";

@Injectable()
export class GamesService {
	private readonly logger = new Logger(GamesService.name);

	constructor(private readonly rawgService: RawgService) {}

	async search(query: string): Promise<GameSearchResultResponseDto[]> {
		try {
			this.logger.log(`Searching games for query: "${query}"`);

			const rawgResponse = await this.rawgService.searchGames(query);

			return this.toSearchResults(rawgResponse.results);
		} catch (error) {
			this.logger.error(
				"Failed to search games",
				error instanceof Error ? error.stack : String(error),
			);
			throw error;
		}
	}

	async getPopularGames(): Promise<GameSearchResultResponseDto[]> {
		try {
			this.logger.log("Fetching popular games");

			const rawgResponse = await this.rawgService.getPopularGames();

			return this.toSearchResults(rawgResponse.results);
		} catch (error) {
			this.logger.error(
				"Failed to fetch popular games",
				error instanceof Error ? error.stack : String(error),
			);
			throw error;
		}
	}

	private toSearchResults(games: RawgGame[]): GameSearchResultResponseDto[] {
		return plainToInstance(
			GameSearchResultResponseDto,
			games.map((game) => ({
				id: game.id,
				name: game.name,
				coverUrl: game.background_image || null,
				releaseDate: game.released ?? null,
				metacritic: game.metacritic ?? null,
			})),
			{ excludeExtraneousValues: true },
		);
	}

	async getGameDetails(id: string): Promise<GameDetailsResponseDto> {
		try {
			this.logger.log(`Fetching game details for ID: "${id}"`);

			const game = await this.rawgService.getGameDetails(id);

			return plainToInstance(
				GameDetailsResponseDto,
				{
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
				},
				{ excludeExtraneousValues: true },
			);
		} catch (error) {
			this.logger.error(
				"Failed to fetch game details",
				error instanceof Error ? error.stack : String(error),
			);
			throw error;
		}
	}
}
