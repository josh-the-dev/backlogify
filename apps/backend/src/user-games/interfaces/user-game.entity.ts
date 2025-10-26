import { GameStatus } from "@backlogify/types";

export interface UserGame {
	id: string;
	userId: string;
	externalServiceId: string;
	name: string;
	coverUrl?: string | null;
	status: GameStatus;
	addedAt: Date;
}
