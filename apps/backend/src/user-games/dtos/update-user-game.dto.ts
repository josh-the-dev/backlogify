import { GameStatus } from "@backlogify/types";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export const GAME_STATUSES = [
	"backlog",
	"playing",
	"played",
	"abandoned",
] as const;

export class UpdateUserGameDto {
	@ApiPropertyOptional({ enum: GAME_STATUSES, example: "playing" })
	@IsOptional()
	@IsIn(GAME_STATUSES)
	status?: GameStatus;

	@ApiPropertyOptional({
		example: "Stopped at the water temple. We all know why.",
		nullable: true,
		maxLength: 500,
	})
	@IsOptional()
	@IsString()
	@MaxLength(500)
	note?: string | null;

	@ApiPropertyOptional({
		example: "2026-06-12T18:00:00.000Z",
		nullable: true,
		description:
			"Set automatically when status moves to played; send explicitly to backdate or clear",
	})
	@IsOptional()
	@IsDateString()
	finishedAt?: string | null;
}
