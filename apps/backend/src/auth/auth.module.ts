import { Module } from "@nestjs/common";
import { ApiKeyGuard } from "./api-key.guard";
import { ClerkAuthGuard } from "./auth.guard";

@Module({
	providers: [ClerkAuthGuard, ApiKeyGuard],
	exports: [ClerkAuthGuard, ApiKeyGuard],
})
export class AuthModule {}
