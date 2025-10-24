import { Module } from "@nestjs/common";
import { RawgModule } from "../rawg/rawg.module";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";

@Module({
	imports: [RawgModule],
	controllers: [GamesController],
	providers: [GamesService],
})
export class GamesModule {}
