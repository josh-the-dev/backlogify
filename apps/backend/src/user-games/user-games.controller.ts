import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import {
	addUserGameSchema,
	paginationSchema,
	updateUserGameSchema,
	userGameSchema,
	type AddUserGame,
	type Pagination,
	type UpdateUserGame,
} from "@backlogify/types";
import { ClerkAuthGuard, UserId } from "../auth";
import { ApiSchemaResponse } from "../common/api-schema-response.decorator";
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
	@ApiSchemaResponse(userGameSchema, {
		status: 200,
		description: "Paginated list of user games",
		isArray: true,
	})
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	getAll(
		@UserId() userId: string,
		@Query({ schema: paginationSchema }) pagination: Pagination,
	) {
		return this.userGamesService.getAll(userId, pagination);
	}

	@Post()
	@HttpCode(201)
	@ApiOperation({ summary: "Add a game to the authenticated user's backlog" })
	@ApiSchemaResponse(userGameSchema, {
		status: 201,
		description: "Game added to backlog",
	})
	@ApiResponse({ status: 400, description: "Invalid request body" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	addGame(
		@UserId() userId: string,
		@Body({ schema: addUserGameSchema }) body: AddUserGame,
	) {
		return this.userGamesService.add(userId, body);
	}

	@Patch(":gameId")
	@ApiOperation({
		summary: "Update a game's status, note, finish date, or Up next pin",
	})
	@ApiSchemaResponse(userGameSchema, {
		status: 200,
		description: "Game updated",
	})
	@ApiResponse({
		status: 400,
		description: "Invalid field value or empty body",
	})
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	@ApiResponse({ status: 404, description: "Game not found for this user" })
	update(
		@UserId() userId: string,
		@Param("gameId", ParseUUIDPipe) gameId: string,
		@Body({ schema: updateUserGameSchema }) body: UpdateUserGame,
	) {
		if (
			body.status === undefined &&
			body.note === undefined &&
			body.finishedAt === undefined &&
			body.pinned === undefined
		) {
			throw new BadRequestException("Nothing to update");
		}

		return this.userGamesService.update(userId, gameId, body);
	}

	@Delete(":gameId")
	@HttpCode(204)
	@ApiOperation({ summary: "Remove a game from the backlog" })
	@ApiResponse({ status: 204, description: "Game removed" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	@ApiResponse({ status: 404, description: "Game not found for this user" })
	remove(
		@UserId() userId: string,
		@Param("gameId", ParseUUIDPipe) gameId: string,
	): Promise<void> {
		return this.userGamesService.remove(userId, gameId);
	}
}
