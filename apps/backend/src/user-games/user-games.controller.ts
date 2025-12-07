import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
	ValidationPipe,
} from "@nestjs/common";
import { ClerkAuthGuard, UserId } from "../auth";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { UpdateUserGameStatusDto } from "./dtos/update-user-game-status.dto";
import { UserGamesService } from "./user-games.service";

@Controller("user-games")
@UseGuards(ClerkAuthGuard)
export class UserGamesController {
	constructor(private readonly userGamesService: UserGamesService) {}

	@Get()
	getAll(@UserId() userId: string) {
		return this.userGamesService.getAll(userId);
	}

	@Post()
	addGame(
		@UserId() userId: string,
		@Body(ValidationPipe) body: AddUserGameDto,
	) {
		return this.userGamesService.add(userId, body);
	}

	@Patch(":gameId/status")
	updateStatus(
		@UserId() userId: string,
		@Param("gameId") gameId: string,
		@Body(ValidationPipe) body: UpdateUserGameStatusDto,
	) {
		return this.userGamesService.updateStatus(userId, gameId, body.status);
	}

	@Delete(":gameId")
	remove(@UserId() userId: string, @Param("gameId") gameId: string) {
		return this.userGamesService.remove(userId, gameId);
	}
}
