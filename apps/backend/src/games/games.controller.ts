import {
	BadRequestException,
	Controller,
	DefaultValuePipe,
	Get,
	Param,
	ParseIntPipe,
	Query,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { GamesService } from "./games.service";
import { GameDetailsResponseDto } from "./dtos/game-details.response.dto";
import { GameSearchResultResponseDto } from "./dtos/game-search-result.response.dto";

@ApiTags("games")
@ApiSecurity("api-key")
@Controller("games")
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Get("search")
	@ApiOperation({ summary: "Search games by title" })
	@ApiQuery({ name: "query", description: "Game title to search for", example: "Grand Theft Auto" })
	@ApiQuery({ name: "page", description: "Result page (20 per page)", required: false, example: 1 })
	@ApiResponse({ status: 200, type: [GameSearchResultResponseDto], description: "List of matching games" })
	@ApiResponse({ status: 400, description: "Query parameter is missing or blank, or page is invalid" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	async search(
		@Query("query") query: string,
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
	): Promise<GameSearchResultResponseDto[]> {
		if (!query || query.trim().length === 0) {
			throw new BadRequestException("Search query is required");
		}
		if (page < 1) {
			throw new BadRequestException("Page must be at least 1");
		}

		return this.gamesService.search(query.trim(), page);
	}

	@Get("popular")
	@ApiOperation({ summary: "Get currently popular games" })
	@ApiQuery({ name: "page", description: "Result page (20 per page)", required: false, example: 1 })
	@ApiResponse({ status: 200, type: [GameSearchResultResponseDto], description: "List of popular games" })
	@ApiResponse({ status: 400, description: "Page is invalid" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	async getPopularGames(
		@Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number,
	): Promise<GameSearchResultResponseDto[]> {
		if (page < 1) {
			throw new BadRequestException("Page must be at least 1");
		}

		return this.gamesService.getPopularGames(page);
	}

	@Get(":id")
	@ApiOperation({ summary: "Get full details for a game by RAWG ID" })
	@ApiResponse({ status: 200, type: GameDetailsResponseDto, description: "Game details" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	@ApiResponse({ status: 404, description: "Game not found" })
	async getGameDetails(@Param("id", ParseIntPipe) id: number): Promise<GameDetailsResponseDto> {
		return this.gamesService.getGameDetails(String(id));
	}
}
