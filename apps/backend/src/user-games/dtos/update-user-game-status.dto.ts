import { GameStatus } from "@backlogify/types";
import { IsIn } from "class-validator";

export class UpdateUserGameStatusDto {
	@IsIn(["backlog", "playing", "played"])
	status: GameStatus;
}
