import {
	Body,
	Controller,
	Get,
	Param,
	Put,
	Query,
	UseGuards,
	ValidationPipe,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import { ClerkAuthGuard, UserId } from "../auth";
import { PaginationDto } from "../user-games/dtos/pagination.dto";
import { ProfileResponseDto } from "./dtos/profile.response.dto";
import { PublicBacklogResponseDto } from "./dtos/public-backlog.response.dto";
import { UpdateProfileDto } from "./dtos/update-profile.dto";
import { ProfilesService } from "./profiles.service";

@ApiTags("profiles")
@ApiSecurity("api-key")
@Controller("profiles")
export class ProfilesController {
	constructor(private readonly profilesService: ProfilesService) {}

	@Get("me")
	@UseGuards(ClerkAuthGuard)
	@ApiBearerAuth("clerk-jwt")
	@ApiOperation({ summary: "Get the authenticated user's share profile" })
	@ApiResponse({
		status: 200,
		type: ProfileResponseDto,
		description: "The user's profile, or null if they haven't claimed one",
	})
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	getMine(@UserId() userId: string): Promise<ProfileResponseDto | null> {
		return this.profilesService.getMine(userId);
	}

	@Put("me")
	@UseGuards(ClerkAuthGuard)
	@ApiBearerAuth("clerk-jwt")
	@ApiOperation({
		summary: "Claim or update the user's username and visibility",
	})
	@ApiResponse({
		status: 200,
		type: ProfileResponseDto,
		description: "Profile saved",
	})
	@ApiResponse({ status: 400, description: "Invalid username" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	@ApiResponse({ status: 409, description: "Username already taken" })
	upsert(
		@UserId() userId: string,
		@Body(ValidationPipe) body: UpdateProfileDto,
	): Promise<ProfileResponseDto> {
		return this.profilesService.upsert(userId, body);
	}

	// Public: no Clerk JWT, but still behind the global ApiKeyGuard for
	// server-to-server. Returns 404 for missing or private profiles alike.
	@Get(":username/backlog")
	@ApiOperation({ summary: "Get a user's public backlog by username" })
	@ApiResponse({
		status: 200,
		type: PublicBacklogResponseDto,
		description: "The public backlog",
	})
	@ApiResponse({
		status: 404,
		description: "No public backlog at this username",
	})
	getPublicBacklog(
		@Param("username") username: string,
		@Query(ValidationPipe) pagination: PaginationDto,
	): Promise<PublicBacklogResponseDto> {
		return this.profilesService.getPublicBacklog(username, pagination);
	}
}
