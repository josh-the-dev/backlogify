import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClerkAuthGuard } from "../auth";
import { UserGamesController } from "./user-games.controller";
import { UserGamesService } from "./user-games.service";

@Module({
	imports: [ConfigModule],
	controllers: [UserGamesController],
	providers: [UserGamesService, ClerkAuthGuard],
	exports: [UserGamesService],
})
export class UserGamesModule {}
