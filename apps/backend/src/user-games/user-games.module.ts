import { Module } from "@nestjs/common";
import { AuthModule } from "../auth";
import { UserGamesController } from "./user-games.controller";
import { UserGamesService } from "./user-games.service";

@Module({
	imports: [AuthModule],
	controllers: [UserGamesController],
	providers: [UserGamesService],
	exports: [UserGamesService],
})
export class UserGamesModule {}
