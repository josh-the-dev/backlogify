import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { BacklogsModule } from "./backlogs/backlogs.module";
import { GamesModule } from "./games/games.module";

@Module({
	controllers: [AppController],
	providers: [AppService],
	imports: [GamesModule, ConfigModule.forRoot(), BacklogsModule],
})
export class AppModule {}
