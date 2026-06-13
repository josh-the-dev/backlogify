import { Module } from "@nestjs/common";
import { AuthModule } from "../auth";
import { ProfilesController } from "./profiles.controller";
import { ProfilesService } from "./profiles.service";

@Module({
	imports: [AuthModule],
	controllers: [ProfilesController],
	providers: [ProfilesService],
})
export class ProfilesModule {}
