import {
	MiddlewareConsumer,
	Module,
	NestModule,
	StandardSchemaSerializerInterceptor,
	StandardSchemaValidationPipe,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { z } from "zod";
import { CorrelationIdMiddleware } from "./common/correlation-id.middleware";
import { AllExceptionsFilter } from "./common/http-exception.filter";
import { LoggingInterceptor } from "./common/logging.interceptor";

import { ApiKeyGuard, AuthModule } from "./auth";
import { DatabaseModule } from "./database";
import { GamesModule } from "./games/games.module";
import { HealthModule } from "./health/health.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { UserGamesModule } from "./user-games/user-games.module";

const envSchema = z.object({
	DATABASE_URL: z.string(),
	RAWG_API_KEY: z.string(),
	CLERK_SECRET_KEY: z.string(),
	CLERK_PUBLISHABLE_KEY: z.string(),
	API_KEY: z.string(),
	FRONTEND_URL: z.string().default("http://localhost:3000"),
	PORT: z.coerce.number().default(3001),
});

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			validate: (config) => {
				const result = envSchema.safeParse(config);
				if (!result.success) {
					throw new Error(`Config validation error:\n${result.error.message}`);
				}
				return result.data;
			},
		}),
		ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
		DatabaseModule,
		AuthModule,
		GamesModule,
		HealthModule,
		ProfilesModule,
		UserGamesModule,
	],
	providers: [
		{ provide: APP_GUARD, useClass: ThrottlerGuard },
		// ApiKeyGuard runs globally on every route, validating the x-api-key header.
		// User-games routes additionally require a valid Clerk JWT via ClerkAuthGuard,
		// which is applied at the controller level using @UseGuards(ClerkAuthGuard).
		{ provide: APP_GUARD, useClass: ApiKeyGuard },
		// Registered here rather than in main.ts so e2e tests, which build
		// the app from AppModule, run the same pipeline as production.
		// Bodies/queries validate against the schema passed to @Body/@Query,
		// and responses serialize through the one set by @ApiSchemaResponse
		{ provide: APP_FILTER, useClass: AllExceptionsFilter },
		{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
		{ provide: APP_INTERCEPTOR, useClass: StandardSchemaSerializerInterceptor },
		{
			provide: APP_PIPE,
			useValue: new StandardSchemaValidationPipe({ transform: true }),
		},
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(CorrelationIdMiddleware).forRoutes("*");
	}
}
