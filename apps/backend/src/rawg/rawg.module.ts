import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RawgService } from "./rawg.service";

@Module({
	imports: [ConfigModule],
	providers: [RawgService],
	exports: [RawgService],
})
export class RawgModule {}
