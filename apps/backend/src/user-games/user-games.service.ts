import {
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { eq, and, isNotNull } from "drizzle-orm";
import type {
	AddUserGame,
	Pagination,
	UpdateUserGame,
} from "@backlogify/types";
import { DRIZZLE, userGames } from "../database";
import * as schema from "../database/schema";

type UserGameRow = typeof userGames.$inferSelect;

@Injectable()
export class UserGamesService {
	private readonly logger = new Logger(UserGamesService.name);

	constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

	async getAll(
		userId: string,
		{ limit = 50, offset = 0 }: Partial<Pagination> = {},
	): Promise<UserGameRow[]> {
		try {
			return await this.db
				.select()
				.from(userGames)
				.where(eq(userGames.userId, userId))
				.limit(limit)
				.offset(offset);
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				"Failed to fetch user games",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to fetch user games");
		}
	}

	async add(userId: string, dto: AddUserGame): Promise<UserGameRow> {
		try {
			const [inserted] = await this.db
				.insert(userGames)
				.values({
					userId,
					externalServiceId: dto.externalServiceId,
					name: dto.name,
					coverUrl: dto.coverUrl || null,
					status: dto.status,
					finishedAt: dto.status === "played" ? new Date() : null,
				})
				.returning();

			return inserted;
		} catch (error) {
			this.logger.error(
				"Failed to add user game",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to add game");
		}
	}

	async update(
		userId: string,
		gameId: string,
		dto: UpdateUserGame,
	): Promise<UserGameRow> {
		const changes: Partial<typeof userGames.$inferInsert> = {};

		if (dto.status !== undefined) {
			changes.status = dto.status;
			// Moving to played stamps the finish date (unless one was sent
			// along); moving anywhere else clears it - the game is no longer
			// finished
			changes.finishedAt =
				dto.status === "played"
					? dto.finishedAt
						? new Date(dto.finishedAt)
						: new Date()
					: null;
		} else if (dto.finishedAt !== undefined) {
			changes.finishedAt = dto.finishedAt ? new Date(dto.finishedAt) : null;
		}

		if (dto.note !== undefined) {
			changes.note = dto.note;
		}

		if (dto.pinned !== undefined) {
			changes.pinnedAt = dto.pinned ? new Date() : null;
		} else if (dto.status === "played" || dto.status === "abandoned") {
			// Finishing or abandoning a game frees the Up next slot
			changes.pinnedAt = null;
		}

		try {
			if (dto.pinned) {
				// Unpin everything first so "at most one pinned game" holds
				// even if the second statement fails
				await this.db
					.update(userGames)
					.set({ pinnedAt: null })
					.where(
						and(eq(userGames.userId, userId), isNotNull(userGames.pinnedAt)),
					);
			}

			const [updated] = await this.db
				.update(userGames)
				.set(changes)
				.where(and(eq(userGames.userId, userId), eq(userGames.id, gameId)))
				.returning();

			if (!updated) {
				throw new NotFoundException("Game not found for this user");
			}

			return updated;
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				`Failed to update game ${gameId}`,
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to update game");
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
