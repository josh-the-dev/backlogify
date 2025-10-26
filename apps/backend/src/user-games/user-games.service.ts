import { GameStatus } from "@backlogify/types";
import { Injectable, NotFoundException } from "@nestjs/common";
import { AddUserGameDto } from "./dtos/add-user-game.dto";
import { UserGame } from "./interfaces/user-game.entity";

@Injectable()
export class UserGamesService {
	private userGames: UserGame[] = [];

	getAll(userId: string): UserGame[] {
		return this.userGames.filter((g) => g.userId === userId);
	}

	add(userId: string, dto: AddUserGameDto) {
		const newGame: UserGame = {
			id: crypto.randomUUID(),
			userId,
			externalServiceId: dto.externalServiceId,
			name: dto.name,
			coverUrl: dto.coverUrl || null,
			status: dto.status,
			addedAt: new Date(),
		};

		this.userGames.push(newGame);
		return newGame;
	}

	updateStatus(userId: string, gameId: string, status: GameStatus) {
		const game = this.userGames.find(
			(g) => g.userId === userId && g.id === gameId,
		);

		if (!game) {
			throw new NotFoundException("Game not found for this user");
		}

		game.status = status;
		return game;
	}

	remove(userId: string, gameId: string) {
		const index = this.userGames.findIndex(
			(g) => g.userId === userId && g.id === gameId,
		);

		if (index === -1) {
			throw new NotFoundException("Game not found for this user");
		}

		this.userGames.splice(index, 1);
	}
}
