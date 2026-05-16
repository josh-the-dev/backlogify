import { GameStatus } from "@backlogify/types";
import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { DRIZZLE, userGames } from "../database";
import * as schema from "../database/schema";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { PaginationDto } from "./dtos/pagination.dto";
import { UserGameResponseDto } from "./dtos/user-game.response.dto";

@Injectable()
export class UserGamesService {
	private readonly logger = new Logger(UserGamesService.name);

	constructor(
		@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
	) {}

	async getAll(userId: string, { limit = 50, offset = 0 }: PaginationDto = {}): Promise<UserGameResponseDto[]> {
		try {
			const results = await this.db
				.select()
				.from(userGames)
				.where(eq(userGames.userId, userId))
				.limit(limit)
				.offset(offset);

			return plainToInstance(UserGameResponseDto, results, {
				excludeExtraneousValues: true,
			});
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				"Failed to fetch user games",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to fetch user games");
		}
	}

	async add(userId: string, dto: AddUserGameDto): Promise<UserGameResponseDto> {
		try {
			const [inserted] = await this.db
				.insert(userGames)
				.values({
					userId,
					externalServiceId: dto.externalServiceId,
					name: dto.name,
					coverUrl: dto.coverUrl || null,
					status: dto.status,
				})
				.returning();

			return plainToInstance(UserGameResponseDto, inserted, {
				excludeExtraneousValues: true,
			});
		} catch (error) {
			this.logger.error(
				"Failed to add user game",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to add game");
		}
	}

	async updateStatus(
		userId: string,
		gameId: string,
		status: GameStatus,
	): Promise<UserGameResponseDto> {
		try {
			const [updated] = await this.db
				.update(userGames)
				.set({ status })
				.where(and(eq(userGames.userId, userId), eq(userGames.id, gameId)))
				.returning();

			if (!updated) {
				throw new NotFoundException("Game not found for this user");
			}

			return plainToInstance(UserGameResponseDto, updated, {
				excludeExtraneousValues: true,
			});
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				`Failed to update status for game ${gameId}`,
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to update game status");
		}
	}

	async remove(userId: string, gameId: string): Promise<void> {
		try {
			const result = await this.db
				.delete(userGames)
				.where(and(eq(userGames.userId, userId), eq(userGames.id, gameId)))
				.returning({ id: userGames.id });

			if (result.length === 0) {
				throw new NotFoundException("Game not found for this user");
			}
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				`Failed to remove game ${gameId}`,
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to remove game");
		}
	}
}
