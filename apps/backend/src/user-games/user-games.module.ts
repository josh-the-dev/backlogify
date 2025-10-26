import { Module } from "@nestjs/common";
import { UserGamesController } from "./user-games.controller";
import { UserGamesService } from "./user-games.service";

@Module({
	controllers: [UserGamesController],
	providers: [UserGamesService],
	exports: [UserGamesService],
})
export class UserGamesModule {}
