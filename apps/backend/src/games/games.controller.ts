import {
	BadRequestException,
	Controller,
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
	@ApiResponse({ status: 200, type: [GameSearchResultResponseDto], description: "List of matching games" })
	@ApiResponse({ status: 400, description: "Query parameter is missing or blank" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	async search(@Query("query") query: string): Promise<GameSearchResultResponseDto[]> {
		if (!query || query.trim().length === 0) {
			throw new BadRequestException("Search query is required");
		}

		return this.gamesService.search(query.trim());
	}

	@Get("popular")
	@ApiOperation({ summary: "Get currently popular games" })
	@ApiResponse({ status: 200, type: [GameSearchResultResponseDto], description: "List of popular games" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	async getPopularGames(): Promise<GameSearchResultResponseDto[]> {
		return this.gamesService.getPopularGames();
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
