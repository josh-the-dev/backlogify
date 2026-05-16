import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

import { ApiKeyGuard, AuthModule } from "./auth";
import { DatabaseModule } from "./database";
import { GamesModule } from "./games/games.module";
import { UserGamesModule } from "./user-games/user-games.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
		DatabaseModule,
		AuthModule,
		GamesModule,
		UserGamesModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		// ApiKeyGuard runs globally on every route, validating the x-api-key header.
		// User-games routes additionally require a valid Clerk JWT via ClerkAuthGuard,
		// which is applied at the controller level using @UseGuards(ClerkAuthGuard).
		{ provide: APP_GUARD, useClass: ApiKeyGuard },
	],
})
export class AppModule {}
