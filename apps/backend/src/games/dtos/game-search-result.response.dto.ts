import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class GameSearchResultResponseDto {
	@Expose()
	@ApiProperty({ example: 3498 })
	id: number;

	@Expose()
	@ApiProperty({ example: "Grand Theft Auto V" })
	name: string;

	@Expose()
	@ApiPropertyOptional({
		example: "https://media.rawg.io/media/games/456/cover.jpg",
		nullable: true,
	})
	coverUrl: string | null;
}
