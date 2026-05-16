import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class UserGameResponseDto {
	@Expose()
	@ApiProperty({ example: "550e8400-e29b-41d4-a716-446655440000" })
	id: string;

	@Expose()
	@ApiProperty({ example: "user_2abc123def456" })
	userId: string;

	@Expose()
	@ApiProperty({ example: "3498" })
	externalServiceId: string;

	@Expose()
	@ApiProperty({ example: "Grand Theft Auto V" })
	name: string;

	@Expose()
	@ApiPropertyOptional({
		example: "https://media.rawg.io/media/games/456/cover.jpg",
		nullable: true,
	})
	coverUrl: string | null;

	@Expose()
	@ApiProperty({ enum: ["backlog", "playing", "played"], example: "backlog" })
	status: string;

	@Expose()
	@ApiProperty({ example: "2024-01-15T10:30:00.000Z" })
	addedAt: Date;
}
