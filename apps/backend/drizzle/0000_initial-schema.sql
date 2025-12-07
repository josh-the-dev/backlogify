CREATE TYPE "public"."game_status" AS ENUM('backlog', 'playing', 'played');--> statement-breakpoint
CREATE TABLE "user_games" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"external_service_id" varchar(255) NOT NULL,
	"name" varchar(500) NOT NULL,
	"cover_url" text,
	"status" "game_status" DEFAULT 'backlog' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
