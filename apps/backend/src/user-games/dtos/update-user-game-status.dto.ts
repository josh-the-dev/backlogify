import { GameStatus } from "@backlogify/types";
import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";

export class UpdateUserGameStatusDto {
	@ApiProperty({ enum: ["backlog", "playing", "played"], example: "playing" })
	@IsIn(["backlog", "playing", "played"])
	status: GameStatus;
}
