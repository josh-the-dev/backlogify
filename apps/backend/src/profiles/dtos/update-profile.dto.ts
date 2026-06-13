import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, Matches } from "class-validator";

// 3-30 chars, starts and ends alphanumeric, allows - and _ in the middle.
// Case-insensitive here; the service lowercases before storing.
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28})[a-z0-9]$/i;

// Usernames we won't hand out: app route segments (avoids confusing
// /u/<name> with real surfaces) and impersonation-prone words. Compared
// against the lowercased username.
export const RESERVED_USERNAMES = new Set([
	"u",
	"api",
	"games",
	"my-games",
	"sign-in",
	"sign-up",
	"signin",
	"signup",
	"settings",
	"profile",
	"profiles",
	"me",
	"admin",
	"administrator",
	"root",
	"support",
	"help",
	"about",
	"contact",
	"backlogify",
	"official",
	"staff",
	"mod",
	"moderator",
	"system",
	"null",
	"undefined",
	"anonymous",
	"www",
	"mail",
	"assets",
	"static",
	"favicon",
]);

export class UpdateProfileDto {
	@ApiProperty({
		example: "ada-lovelace",
		description:
			"3-30 chars, letters/numbers/hyphen/underscore, must start and end alphanumeric. Stored lowercased.",
	})
	@Matches(USERNAME_PATTERN, {
		message:
			"Username must be 3-30 characters: letters, numbers, hyphens or underscores, starting and ending with a letter or number",
	})
	username: string;

	@ApiProperty({
		example: true,
		description: "Whether the backlog is visible at /u/:username",
	})
	@IsBoolean()
	isPublic: boolean;
}
