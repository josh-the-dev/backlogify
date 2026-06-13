import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, Matches } from "class-validator";

// 3-30 chars, starts and ends alphanumeric, allows - and _ in the middle.
// Case-insensitive here; the service lowercases before storing.
export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_-]{1,28})[a-z0-9]$/i;

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
