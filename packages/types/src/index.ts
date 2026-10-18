import { z } from "zod";

// Zod schemas are the single source of truth for API shapes: the backend
// validates requests and serializes responses with them (and Swagger is
// generated from them), and the frontend imports the inferred types.

// Dates travel as ISO strings. The input side accepts the Date objects
// Drizzle returns, so the backend serializer can encode them for the wire.
const isoDateTime = z.codec(z.date(), z.iso.datetime(), {
	decode: (date) => date.toISOString(),
	encode: (iso) => new Date(iso),
});

// Game types
export const gameSearchResultSchema = z
	.object({
		id: z.number().int().meta({ example: 3498 }),
		name: z.string().meta({ example: "Grand Theft Auto V" }),
		coverUrl: z
			.string()
			.nullable()
			.meta({ example: "https://media.rawg.io/media/games/456/cover.jpg" }),
		releaseDate: z.string().nullable().meta({ example: "2013-09-17" }),
		metacritic: z.number().nullable().meta({ example: 92 }),
	})
	.meta({ id: "GameSearchResult" });
export type GameSearchResult = z.output<typeof gameSearchResultSchema>;

export const gameDetailsSchema = z
	.object({
		id: z.number().int().meta({ example: 3498 }),
		name: z.string().meta({ example: "Grand Theft Auto V" }),
		description: z
			.string()
			.meta({ example: "An open world action-adventure game." }),
		releaseDate: z.string().nullable().meta({ example: "2013-09-17" }),
		coverUrl: z
			.string()
			.nullable()
			.meta({ example: "https://media.rawg.io/media/games/456/cover.jpg" }),
		genres: z.array(z.string()).meta({ example: ["Action", "Adventure"] }),
		platforms: z.array(z.string()).meta({ example: ["PC", "PlayStation 5"] }),
	})
	.meta({ id: "GameDetails" });
export type GameDetails = z.output<typeof gameDetailsSchema>;

export const storeLinkSchema = z
	.object({
		storeId: z.number().int().meta({ example: 1 }),
		name: z.string().meta({ example: "Steam" }),
		url: z.string().meta({
			example: "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/",
		}),
	})
	.meta({ id: "StoreLink" });
export type StoreLink = z.output<typeof storeLinkSchema>;

export const gameExtrasSchema = z
	.object({
		screenshots: z
			.array(z.string())
			.meta({ example: ["https://media.rawg.io/media/screenshots/abc.jpg"] }),
		stores: z.array(storeLinkSchema),
		similar: z.array(gameSearchResultSchema),
	})
	.meta({ id: "GameExtras" });
export type GameExtras = z.output<typeof gameExtrasSchema>;

export const GAME_STATUSES = [
	"backlog",
	"playing",
	"played",
	"abandoned",
] as const;
export const gameStatusSchema = z.enum(GAME_STATUSES).meta({
	example: "backlog",
});
export type GameStatus = z.output<typeof gameStatusSchema>;

// User game types
export const userGameSchema = z
	.object({
		id: z.uuid().meta({ example: "550e8400-e29b-41d4-a716-446655440000" }),
		userId: z.string().meta({ example: "user_2abc123def456" }),
		externalServiceId: z.string().meta({ example: "3498" }),
		name: z.string().meta({ example: "Grand Theft Auto V" }),
		coverUrl: z
			.string()
			.nullable()
			.meta({ example: "https://media.rawg.io/media/games/456/cover.jpg" }),
		status: gameStatusSchema,
		addedAt: isoDateTime.meta({ example: "2024-01-15T10:30:00.000Z" }),
		finishedAt: isoDateTime
			.nullable()
			.meta({ example: "2026-06-12T18:00:00.000Z" }),
		note: z
			.string()
			.nullable()
			.meta({ example: "Stopped at the water temple." }),
		pinnedAt: isoDateTime
			.nullable()
			.meta({ example: "2026-06-12T18:00:00.000Z" }),
	})
	.meta({ id: "UserGame" });
export type UserGame = z.output<typeof userGameSchema>;

export const addUserGameSchema = z
	.strictObject({
		externalServiceId: z.string().min(1).meta({ example: "3498" }),
		name: z.string().min(1).meta({ example: "Grand Theft Auto V" }),
		coverUrl: z.string().optional().meta({
			example:
				"https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg",
		}),
		status: gameStatusSchema,
	})
	.meta({ id: "AddUserGame" });
export type AddUserGame = z.output<typeof addUserGameSchema>;

export const updateUserGameSchema = z
	.strictObject({
		status: gameStatusSchema.optional(),
		note: z.string().max(500).nullable().optional().meta({
			example: "Stopped at the water temple. We all know why.",
		}),
		finishedAt: z
			.union([z.iso.datetime({ offset: true }), z.iso.date()])
			.nullable()
			.optional()
			.meta({
				example: "2026-06-12T18:00:00.000Z",
				description:
					"Set automatically when status moves to played; send explicitly to backdate or clear",
			}),
		pinned: z.boolean().optional().meta({
			example: true,
			description:
				"true pins this game as the single Up next slot (any other pinned game is unpinned); false clears the pin",
		}),
	})
	.meta({ id: "UpdateUserGame" });
export type UpdateUserGame = z.output<typeof updateUserGameSchema>;

export const paginationSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(50),
	offset: z.coerce.number().int().min(0).default(0),
});
export type Pagination = z.output<typeof paginationSchema>;

// Public sharing types

// 3-30 chars, starts and ends alphanumeric, allows - and _ in the middle.
// Case-insensitive here; the backend lowercases before storing.
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28})[a-z0-9]$/i;

// Usernames we won't hand out: app route segments (avoids confusing
// /u/<name> with real surfaces) and impersonation-prone words. Compared
// against the lowercased username.
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
	"u",
	"api",
	"games",
	"my-games",
	"sign-in",
	"sign-up",
	"signin",
	"signup",
	"settings",
	"profile",
	"profiles",
	"me",
	"admin",
	"administrator",
	"root",
	"support",
	"help",
	"about",
	"contact",
	"backlogify",
	"official",
	"staff",
	"mod",
	"moderator",
	"system",
	"null",
	"undefined",
	"anonymous",
	"www",
	"mail",
	"assets",
	"static",
	"favicon",
]);

export const userProfileSchema = z
	.object({
		username: z.string().meta({ example: "ada-lovelace" }),
		isPublic: z.boolean().meta({ example: true }),
	})
	.meta({ id: "UserProfile" });
export type UserProfile = z.output<typeof userProfileSchema>;

export const updateProfileSchema = z
	.strictObject({
		username: z
			.string()
			.regex(
				USERNAME_PATTERN,
				"Username must be 3-30 characters: letters, numbers, hyphens or underscores, starting and ending with a letter or number",
			)
			.meta({
				example: "ada-lovelace",
				description:
					"3-30 chars, letters/numbers/hyphen/underscore, must start and end alphanumeric. Stored lowercased.",
			}),
		isPublic: z.boolean().meta({
			example: true,
			description: "Whether the backlog is visible at /u/:username",
		}),
	})
	.meta({ id: "UpdateProfile" });
export type UpdateProfile = z.output<typeof updateProfileSchema>;

// Deliberately omits userId: the Clerk subject id has no business on a
// public surface. The serializer strips it because the schema leaves it out.
export const publicGameSchema = userGameSchema
	.omit({ userId: true })
	.meta({ id: "PublicGame" });
export type PublicGame = z.output<typeof publicGameSchema>;

export const publicBacklogSchema = z
	.object({
		username: z.string().meta({ example: "ada-lovelace" }),
		games: z.array(publicGameSchema),
	})
	.meta({ id: "PublicBacklog" });
export type PublicBacklog = z.output<typeof publicBacklogSchema>;

// API error type
export interface ApiError {
	statusCode: number;
	message: string;
	error?: string;
}
