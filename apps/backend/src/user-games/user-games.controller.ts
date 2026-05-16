import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
	ValidationPipe,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import { UserGame } from "@backlogify/types";
import { ClerkAuthGuard, UserId } from "../auth";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { PaginationDto } from "./dtos/pagination.dto";
import { UpdateUserGameStatusDto } from "./dtos/update-user-game-status.dto";
import { UserGamesService } from "./user-games.service";

@ApiTags("user-games")
@ApiSecurity("api-key")
@ApiBearerAuth("clerk-jwt")
@Controller("user-games")
@UseGuards(ClerkAuthGuard)
export class UserGamesController {
	constructor(private readonly userGamesService: UserGamesService) {}

	@Get()
	@ApiOperation({ summary: "Get the authenticated user's game backlog" })
	@ApiResponse({ status: 200, description: "Paginated list of user games" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	getAll(
		@UserId() userId: string,
		@Query(ValidationPipe) pagination: PaginationDto,
	): Promise<UserGame[]> {
		return this.userGamesService.getAll(userId, pagination);
	}

	@Post()
	@HttpCode(201)
	@ApiOperation({ summary: "Add a game to the authenticated user's backlog" })
	@ApiResponse({ status: 201, description: "Game added to backlog" })
	@ApiResponse({ status: 400, description: "Invalid request body" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	addGame(
		@UserId() userId: string,
		@Body(ValidationPipe) body: AddUserGameDto,
	): Promise<UserGame> {
		return this.userGamesService.add(userId, body);
	}

	@Patch(":gameId/status")
	@ApiOperation({ summary: "Update the status of a game in the backlog" })
	@ApiResponse({ status: 200, description: "Game status updated" })
	@ApiResponse({ status: 400, description: "Invalid status value" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	@ApiResponse({ status: 404, description: "Game not found for this user" })
	updateStatus(
		@UserId() userId: string,
		@Param("gameId") gameId: string,
		@Body(ValidationPipe) body: UpdateUserGameStatusDto,
	): Promise<UserGame> {
		return this.userGamesService.updateStatus(userId, gameId, body.status);
	}

	@Delete(":gameId")
	@HttpCode(204)
	@ApiOperation({ summary: "Remove a game from the backlog" })
	@ApiResponse({ status: 204, description: "Game removed" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	@ApiResponse({ status: 404, description: "Game not found for this user" })
	remove(@UserId() userId: string, @Param("gameId") gameId: string): Promise<void> {
		return this.userGamesService.remove(userId, gameId);
	}
}
