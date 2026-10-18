import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import {
	RESERVED_USERNAMES,
	type Pagination,
	type UpdateProfile,
} from "@backlogify/types";
import { eq, getTableColumns } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE, userGames, userProfiles } from "../database";
import * as schema from "../database/schema";

type ProfileRow = typeof userProfiles.$inferSelect;
type PublicGameRow = Omit<typeof userGames.$inferSelect, "userId">;

// Every user_games column except userId, so the Clerk subject id never
// leaves the database on the public surface (the response schema strips it
// too, this keeps it out even if that decorator were dropped)
const { userId: _userId, ...publicGameColumns } = getTableColumns(userGames);

// Postgres unique-violation error code.
const PG_UNIQUE_VIOLATION = "23505";

@Injectable()
export class ProfilesService {
	private readonly logger = new Logger(ProfilesService.name);

	constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

	async getMine(userId: string): Promise<ProfileRow | null> {
		try {
			const [profile] = await this.db
				.select()
				.from(userProfiles)
				.where(eq(userProfiles.userId, userId))
				.limit(1);

			return profile ?? null;
		} catch (error) {
			this.logger.error(
				"Failed to fetch profile",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to fetch profile");
		}
	}

	async upsert(userId: string, dto: UpdateProfile): Promise<ProfileRow> {
		const username = dto.username.toLowerCase();

		if (RESERVED_USERNAMES.has(username)) {
			throw new BadRequestException("That username isn't available");
		}

		try {
			const [profile] = await this.db
				.insert(userProfiles)
				.values({ userId, username, isPublic: dto.isPublic })
				.onConflictDoUpdate({
					target: userProfiles.userId,
					set: { username, isPublic: dto.isPublic, updatedAt: new Date() },
				})
				.returning();

			return profile;
		} catch (error) {
			// Another user already owns this username (unique constraint on the
			// username column, separate from the userId primary key).
			if (
				typeof error === "object" &&
				error !== null &&
				(error as { code?: string }).code === PG_UNIQUE_VIOLATION
			) {
				throw new ConflictException("That username is taken");
			}
			this.logger.error(
				"Failed to save profile",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to save profile");
		}
	}

	async getPublicBacklog(
		username: string,
		{ limit = 50, offset = 0 }: Partial<Pagination> = {},
	): Promise<{ username: string; games: PublicGameRow[] }> {
		try {
			const [profile] = await this.db
				.select()
				.from(userProfiles)
				.where(eq(userProfiles.username, username.toLowerCase()))
				.limit(1);

			// A missing profile and a private one are indistinguishable to the
			// caller - both 404 - so visitors can't probe who has an account.
			if (!profile || !profile.isPublic) {
				throw new NotFoundException("No public backlog found");
			}

			const games = await this.db
				.select(publicGameColumns)
				.from(userGames)
				.where(eq(userGames.userId, profile.userId))
				.limit(limit)
				.offset(offset);

			return { username: profile.username, games };
		} catch (error) {
			if (error instanceof NotFoundException) throw error;
			this.logger.error(
				"Failed to fetch public backlog",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to fetch public backlog");
		}
	}
}
