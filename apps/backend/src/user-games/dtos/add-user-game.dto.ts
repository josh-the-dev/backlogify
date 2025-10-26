import { GameStatus } from "@backlogify/types";

export class AddUserGameDto {
	externalServiceId: string;
	name: string;
	coverUrl?: string;
	status: GameStatus;
}
