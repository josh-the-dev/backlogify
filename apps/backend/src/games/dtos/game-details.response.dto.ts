import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class GameDetailsResponseDto {
	@Expose()
	@ApiProperty({ example: 3498 })
	id: number;

	@Expose()
	@ApiProperty({ example: "Grand Theft Auto V" })
	name: string;

	@Expose()
	@ApiProperty({ example: "An open world action-adventure game." })
	description: string;

	@Expose()
	@ApiPropertyOptional({ example: "2013-09-17", nullable: true })
	releaseDate: string | null;

	@Expose()
	@ApiPropertyOptional({
		example: "https://media.rawg.io/media/games/456/cover.jpg",
		nullable: true,
	})
	coverUrl: string | null;

	@Expose()
	@ApiProperty({ example: ["Action", "Adventure"], type: [String] })
	genres: string[];

	@Expose()
	@ApiProperty({ example: ["PC", "PlayStation 5"], type: [String] })
	platforms: string[];
}
