import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	UseGuards,
	ValidationPipe,
} from "@nestjs/common";
import { UserGame } from "@backlogify/types";
import { ClerkAuthGuard, UserId } from "../auth";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { UpdateUserGameStatusDto } from "./dtos/update-user-game-status.dto";
import { UserGamesService } from "./user-games.service";

@Controller("user-games")
@UseGuards(ClerkAuthGuard)
export class UserGamesController {
	constructor(private readonly userGamesService: UserGamesService) {}

	@Get()
	getAll(@UserId() userId: string): Promise<UserGame[]> {
		return this.userGamesService.getAll(userId);
	}

	@Post()
	@HttpCode(201)
	addGame(
		@UserId() userId: string,
		@Body(ValidationPipe) body: AddUserGameDto,
	): Promise<UserGame> {
		return this.userGamesService.add(userId, body);
	}

	@Patch(":gameId/status")
	updateStatus(
		@UserId() userId: string,
		@Param("gameId") gameId: string,
		@Body(ValidationPipe) body: UpdateUserGameStatusDto,
	): Promise<UserGame> {
		return this.userGamesService.updateStatus(userId, gameId, body.status);
	}

	@Delete(":gameId")
	@HttpCode(204)
	remove(@UserId() userId: string, @Param("gameId") gameId: string): Promise<void> {
		return this.userGamesService.remove(userId, gameId);
	}
}
