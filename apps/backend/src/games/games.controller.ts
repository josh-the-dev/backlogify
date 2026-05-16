import {
	BadRequestException,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Query,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from "@nestjs/swagger";
import { GameDetails, GameSearchResult } from "@backlogify/types";
import { GamesService } from "./games.service";

@ApiTags("games")
@ApiSecurity("api-key")
@Controller("games")
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Get("search")
	@ApiOperation({ summary: "Search games by title" })
	@ApiQuery({ name: "query", description: "Game title to search for", example: "Grand Theft Auto" })
	@ApiResponse({ status: 200, description: "List of matching games" })
	@ApiResponse({ status: 400, description: "Query parameter is missing or blank" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	async search(@Query("query") query: string): Promise<GameSearchResult[]> {
		if (!query || query.trim().length === 0) {
			throw new BadRequestException("Search query is required");
		}

		return this.gamesService.search(query.trim());
	}

	@Get(":id")
	@ApiOperation({ summary: "Get full details for a game by RAWG ID" })
	@ApiResponse({ status: 200, description: "Game details" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key" })
	@ApiResponse({ status: 404, description: "Game not found" })
	async getGameDetails(@Param("id", ParseIntPipe) id: number): Promise<GameDetails> {
		return this.gamesService.getGameDetails(String(id));
	}
}
