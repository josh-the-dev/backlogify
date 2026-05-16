import {
	BadRequestException,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Query,
} from "@nestjs/common";
import { GameDetails, GameSearchResult } from "@backlogify/types";
import { GamesService } from "./games.service";

@Controller("games")
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Get("search")
	async search(@Query("query") query: string): Promise<GameSearchResult[]> {
		if (!query || query.trim().length === 0) {
			throw new BadRequestException("Search query is required");
		}

		return this.gamesService.search(query.trim());
	}

	@Get(":id")
	async getGameDetails(@Param("id", ParseIntPipe) id: number): Promise<GameDetails> {
		return this.gamesService.getGameDetails(String(id));
	}
}
