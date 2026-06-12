import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const gameStatusEnum = pgEnum('game_status', [
  'backlog',
  'playing',
  'played',
  'abandoned',
]);

export const userGames = pgTable(
  'user_games',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 }).notNull(),
    externalServiceId: varchar('external_service_id', { length: 255 }).notNull(),
    name: varchar('name', { length: 500 }).notNull(),
    coverUrl: text('cover_url'),
    status: gameStatusEnum('status').notNull().default('backlog'),
    addedAt: timestamp('added_at').notNull().defaultNow(),
    finishedAt: timestamp('finished_at'),
    note: text('note'),
  },
  (table) => [index('user_games_user_id_idx').on(table.userId)],
);
