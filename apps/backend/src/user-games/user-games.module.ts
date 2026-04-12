import { Module } from "@nestjs/common";
import { ClerkAuthGuard } from "../auth";
import { UserGamesController } from "./user-games.controller";
import { UserGamesService } from "./user-games.service";

@Module({
	controllers: [UserGamesController],
	providers: [UserGamesService, ClerkAuthGuard],
	exports: [UserGamesService],
})
export class UserGamesModule {}
