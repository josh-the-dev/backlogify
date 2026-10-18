import {
	Body,
	Controller,
	Get,
	Param,
	Put,
	Query,
	UseGuards,
} from "@nestjs/common";
import {
	ApiBearerAuth,
	ApiOperation,
	ApiResponse,
	ApiSecurity,
	ApiTags,
} from "@nestjs/swagger";
import {
	paginationSchema,
	publicBacklogSchema,
	updateProfileSchema,
	userProfileSchema,
	type Pagination,
	type UpdateProfile,
} from "@backlogify/types";
import { ClerkAuthGuard, UserId } from "../auth";
import { ApiSchemaResponse } from "../common/api-schema-response.decorator";
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
	@ApiSchemaResponse(userProfileSchema, {
		status: 200,
		description: "The user's profile, or null if they haven't claimed one",
	})
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	getMine(@UserId() userId: string) {
		return this.profilesService.getMine(userId);
	}

	@Put("me")
	@UseGuards(ClerkAuthGuard)
	@ApiBearerAuth("clerk-jwt")
	@ApiOperation({
		summary: "Claim or update the user's username and visibility",
	})
	@ApiSchemaResponse(userProfileSchema, {
		status: 200,
		description: "Profile saved",
	})
	@ApiResponse({ status: 400, description: "Invalid username" })
	@ApiResponse({ status: 401, description: "Invalid or missing API key / JWT" })
	@ApiResponse({ status: 409, description: "Username already taken" })
	upsert(
		@UserId() userId: string,
		@Body({ schema: updateProfileSchema }) body: UpdateProfile,
	) {
		return this.profilesService.upsert(userId, body);
	}

	// Public: no Clerk JWT, but still behind the global ApiKeyGuard for
	// server-to-server. Returns 404 for missing or private profiles alike.
	@Get(":username/backlog")
	@ApiOperation({ summary: "Get a user's public backlog by username" })
	@ApiSchemaResponse(publicBacklogSchema, {
		status: 200,
		description: "The public backlog",
	})
	@ApiResponse({
		status: 404,
		description: "No public backlog at this username",
	})
	getPublicBacklog(
		@Param("username") username: string,
		@Query({ schema: paginationSchema }) pagination: Pagination,
	) {
		return this.profilesService.getPublicBacklog(username, pagination);
	}
}
