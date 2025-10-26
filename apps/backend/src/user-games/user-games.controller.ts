import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	ValidationPipe,
} from "@nestjs/common";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { UpdateUserGameStatusDto } from "./dtos/update-user-game-status.dto";
import { UserGamesService } from "./user-games.service";

@Controller("users/:userId/games")
export class UserGamesController {
	constructor(private readonly userGamesService: UserGamesService) {}

	@Get()
	getAll(@Param("userId") userId: string) {
		return this.userGamesService.getAll(userId);
	}

	@Post()
	addGame(
		@Param("userId") userId: string,
		@Body(ValidationPipe) body: AddUserGameDto,
	) {
		return this.userGamesService.add(userId, body);
	}

	@Patch(":gameId/status")
	updateStatus(
		@Param("userId") userId: string,
		@Param("gameId") gameId: string,
		@Body(ValidationPipe) body: UpdateUserGameStatusDto,
	) {
		return this.userGamesService.updateStatus(userId, gameId, body.status);
	}

	@Delete(":gameId")
	remove(@Param("userId") userId: string, @Param("gameId") gameId: string) {
		return this.userGamesService.remove(userId, gameId);
	}
}
