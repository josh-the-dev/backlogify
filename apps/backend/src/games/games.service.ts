import { Injectable, Logger } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import type { RawgGame } from "../rawg/interfaces/rawg.interface";
import { RawgService } from "../rawg/rawg.service";
import { GameDetailsResponseDto } from "./dtos/game-details.response.dto";
import { GameExtrasResponseDto } from "./dtos/game-extras.response.dto";
import { GameSearchResultResponseDto } from "./dtos/game-search-result.response.dto";

/**
 * RAWG store IDs are stable public constants; the per-game stores endpoint
 * returns deep-link URLs keyed by store_id but not the store names.
 */
const RAWG_STORE_NAMES: Record<number, string> = {
	1: "Steam",
	2: "Xbox Store",
	3: "PlayStation Store",
	4: "App Store",
	5: "GOG",
	6: "Nintendo Store",
	7: "Xbox 360 Store",
	8: "Google Play",
	9: "itch.io",
	11: "Epic Games",
};

const MAX_SCREENSHOTS = 8;

@Injectable()
export class GamesService {
	private readonly logger = new Logger(GamesService.name);

	constructor(private readonly rawgService: RawgService) {}

	async search(
		query: string,
		page = 1,
	): Promise<GameSearchResultResponseDto[]> {
		try {
			this.logger.log(`Searching games for query: "${query}" (page ${page})`);

			const rawgResponse = await this.rawgService.searchGames(query, page);

			return this.toSearchResults(rawgResponse.results);
		} catch (error) {
			this.logger.error(
				"Failed to search games",
				error instanceof Error ? error.stack : String(error),
			);
			throw error;
		}
	}

	async getPopularGames(page = 1): Promise<GameSearchResultResponseDto[]> {
		try {
			this.logger.log(`Fetching popular games (page ${page})`);

			const rawgResponse = await this.rawgService.getPopularGames(page);

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

	/**
	 * Supplementary detail-page content (screenshots, store links, similar
	 * games). Each RAWG sub-resource is fetched independently and degrades to
	 * an empty list on failure, so a flaky upstream never blanks the page.
	 */
	async getGameExtras(id: string): Promise<GameExtrasResponseDto> {
		this.logger.log(`Fetching game extras for ID: "${id}"`);

		const [screenshots, stores, similar] = await Promise.all([
			this.safe(() => this.rawgService.getScreenshots(id), "screenshots", id),
			this.safe(() => this.rawgService.getStores(id), "stores", id),
			this.safe(() => this.rawgService.getSuggestedGames(id), "similar", id),
		]);

		return plainToInstance(
			GameExtrasResponseDto,
			{
				screenshots: (screenshots?.results ?? [])
					.filter((shot) => shot.image && !shot.is_deleted)
					.slice(0, MAX_SCREENSHOTS)
					.map((shot) => shot.image),
				stores: (stores?.results ?? [])
					.filter((link) => link.url)
					.map((link) => ({
						storeId: link.store_id,
						name: RAWG_STORE_NAMES[link.store_id] ?? "Store",
						url: link.url,
					})),
				similar: this.toSearchResults(similar?.results ?? []),
			},
			{ excludeExtraneousValues: true },
		);
	}

	/**
	 * Runs a RAWG fetch, swallowing failures to null so one bad sub-resource
	 * does not take down the whole extras payload.
	 */
	private async safe<T>(
		fn: () => Promise<T>,
		context: string,
		id: string,
	): Promise<T | null> {
		try {
			return await fn();
		} catch (error) {
			this.logger.warn(
				`Failed to fetch ${context} for ID "${id}": ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
			return null;
		}
	}
}
