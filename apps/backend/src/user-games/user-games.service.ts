import { GameStatus, UserGame } from "@backlogify/types";
import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import { DRIZZLE, userGames } from "../database";
import * as schema from "../database/schema";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { PaginationDto } from "./dtos/pagination.dto";

@Injectable()
export class UserGamesService {
	private readonly logger = new Logger(UserGamesService.name);

	constructor(
		@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
	) {}

	async getAll(userId: string, { limit = 50, offset = 0 }: PaginationDto = {}): Promise<UserGame[]> {
		try {
			const results = await this.db
				.select()
				.from(userGames)
				.where(eq(userGames.userId, userId))
				.limit(limit)
				.offset(offset);

			return results.map((row) => ({
				id: row.id,
				userId: row.userId,
				externalServiceId: row.externalServiceId,
				name: row.name,
				coverUrl: row.coverUrl,
				status: row.status,
				addedAt: row.addedAt,
			}));
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				"Failed to fetch user games",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to fetch user games");
		}
	}

	async add(userId: string, dto: AddUserGameDto): Promise<UserGame> {
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

			return {
				id: inserted.id,
				userId: inserted.userId,
				externalServiceId: inserted.externalServiceId,
				name: inserted.name,
				coverUrl: inserted.coverUrl,
				status: inserted.status,
				addedAt: inserted.addedAt,
			};
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
	): Promise<UserGame> {
		try {
			const [updated] = await this.db
				.update(userGames)
				.set({ status })
				.where(and(eq(userGames.userId, userId), eq(userGames.id, gameId)))
				.returning();

			if (!updated) {
				throw new NotFoundException("Game not found for this user");
			}

			return {
				id: updated.id,
				userId: updated.userId,
				externalServiceId: updated.externalServiceId,
				name: updated.name,
				coverUrl: updated.coverUrl,
				status: updated.status,
				addedAt: updated.addedAt,
			};
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
