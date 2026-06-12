ALTER TYPE "public"."game_status" ADD VALUE 'abandoned';--> statement-breakpoint
ALTER TABLE "user_games" ADD COLUMN "finished_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_games" ADD COLUMN "note" text;