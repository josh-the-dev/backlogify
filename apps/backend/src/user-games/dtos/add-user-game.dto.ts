import { GameStatus } from "@backlogify/types";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddUserGameDto {
	@IsString()
	@IsNotEmpty()
	externalServiceId: string;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsOptional()
	@IsString()
	coverUrl?: string;

	@IsIn(["backlog", "playing", "played"])
	status: GameStatus;
}
