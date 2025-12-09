import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ApiKeyGuard } from "./api-key.guard";
import { ClerkAuthGuard } from "./auth.guard";

@Module({
	imports: [ConfigModule],
	providers: [ClerkAuthGuard, ApiKeyGuard],
	exports: [ClerkAuthGuard, ApiKeyGuard],
})
export class AuthModule {}
