import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { GamesModule } from "./games/games.module";
import { UserGamesModule } from "./user-games/user-games.module";
import { DatabaseModule } from "./database";

@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [
		ConfigModule.forRoot(),
		DatabaseModule,
		GamesModule,
		UserGamesModule,
	],
})
export class AppModule {}
