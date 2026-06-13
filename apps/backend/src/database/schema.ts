import {
	pgTable,
	uuid,
	varchar,
	text,
	timestamp,
	pgEnum,
	index,
	boolean,
} from "drizzle-orm/pg-core";

export const gameStatusEnum = pgEnum("game_status", [
	"backlog",
	"playing",
	"played",
	"abandoned",
]);

export const userGames = pgTable(
	"user_games",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		userId: varchar("user_id", { length: 255 }).notNull(),
		externalServiceId: varchar("external_service_id", {
			length: 255,
		}).notNull(),
		name: varchar("name", { length: 500 }).notNull(),
		coverUrl: text("cover_url"),
		status: gameStatusEnum("status").notNull().default("backlog"),
		addedAt: timestamp("added_at").notNull().defaultNow(),
		finishedAt: timestamp("finished_at"),
		note: text("note"),
		// "Up next" slot: at most one game per user carries a timestamp here,
		// enforced in UserGamesService.update
		pinnedAt: timestamp("pinned_at"),
	},
	(table) => [index("user_games_user_id_idx").on(table.userId)],
);

// One row per Clerk user, created lazily when they first claim a username.
// `userId` is the Clerk subject id (the same value stored on user_games rows);
// `username` is stored lowercased so the unique constraint is effectively
// case-insensitive and slug lookups stay canonical.
export const userProfiles = pgTable("user_profiles", {
	userId: varchar("user_id", { length: 255 }).primaryKey(),
	username: varchar("username", { length: 30 }).notNull().unique(),
	isPublic: boolean("is_public").notNull().default(false),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
