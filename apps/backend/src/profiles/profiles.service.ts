import {
	BadRequestException,
	ConflictException,
	Inject,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
} from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { eq } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { DRIZZLE, userGames, userProfiles } from "../database";
import * as schema from "../database/schema";
import { PaginationDto } from "../user-games/dtos/pagination.dto";
import { ProfileResponseDto } from "./dtos/profile.response.dto";
import { PublicBacklogResponseDto } from "./dtos/public-backlog.response.dto";
import {
	RESERVED_USERNAMES,
	UpdateProfileDto,
} from "./dtos/update-profile.dto";

// Postgres unique-violation error code.
const PG_UNIQUE_VIOLATION = "23505";

@Injectable()
export class ProfilesService {
	private readonly logger = new Logger(ProfilesService.name);

	constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

	async getMine(userId: string): Promise<ProfileResponseDto | null> {
		try {
			const [profile] = await this.db
				.select()
				.from(userProfiles)
				.where(eq(userProfiles.userId, userId))
				.limit(1);

			if (!profile) return null;

			return plainToInstance(ProfileResponseDto, profile, {
				excludeExtraneousValues: true,
			});
		} catch (error) {
			this.logger.error(
				"Failed to fetch profile",
				error instanceof Error ? error.stack : String(error),
			);
			throw new InternalServerErrorException("Failed to fetch profile");
		}
	}

	async upsert(
		userId: string,
		dto: UpdateProfileDto,
	): Promise<ProfileResponseDto> {
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

			return plainToInstance(ProfileResponseDto, profile, {
				excludeExtraneousValues: true,
			});
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
		{ limit = 50, offset = 0 }: PaginationDto = {},
	): Promise<PublicBacklogResponseDto> {
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
				.select()
				.from(userGames)
				.where(eq(userGames.userId, profile.userId))
				.limit(limit)
				.offset(offset);

			return plainToInstance(
				PublicBacklogResponseDto,
				{ username: profile.username, games },
				{ excludeExtraneousValues: true },
			);
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
