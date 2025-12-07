import {
	BadRequestException,
	Controller,
	Get,
	Param,
	Query,
} from "@nestjs/common";
import { GamesService } from "./games.service";

@Controller("games")
export class GamesController {
	constructor(private readonly gamesService: GamesService) {}

	@Get("search")
	async search(@Query("query") query: string) {
		if (!query || query.trim().length === 0) {
			throw new BadRequestException("Search query is required");
		}

		return this.gamesService.search(query.trim());
	}

	@Get(":id")
	async getGameDetails(@Param("id") id: string) {
		if (!id) {
			throw new BadRequestException("Game ID is required");
		}

		return this.gamesService.getGameDetails(id);
	}
}
