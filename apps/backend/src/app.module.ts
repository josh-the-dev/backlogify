import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ApiKeyGuard, AuthModule } from "./auth";
import { DatabaseModule } from "./database";
import { GamesModule } from "./games/games.module";
import { UserGamesModule } from "./user-games/user-games.module";

@Module({
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: APP_GUARD,
			useClass: ApiKeyGuard,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
	imports: [
		ConfigModule.forRoot(),
		ThrottlerModule.forRoot({
			throttlers: [
				{
					ttl: 60000, // 1 minute window
					limit: 100, // 100 requests per minute
				},
			],
		}),
		DatabaseModule,
		AuthModule,
		GamesModule,
		UserGamesModule,
	],
})
export class AppModule {}
