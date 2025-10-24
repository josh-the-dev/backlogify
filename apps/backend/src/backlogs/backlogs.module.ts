import { Module } from "@nestjs/common";
import { BacklogsController } from "./backlogs.controller";
import { BacklogsService } from "./backlogs.service";

@Module({
	controllers: [BacklogsController],
	providers: [BacklogsService],
})
export class BacklogsModule {}
