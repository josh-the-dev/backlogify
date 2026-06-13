import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { GameSearchResultResponseDto } from "./game-search-result.response.dto";

@Exclude()
export class StoreLinkResponseDto {
	@Expose()
	@ApiProperty({ example: 1 })
	storeId: number;

	@Expose()
	@ApiProperty({ example: "Steam" })
	name: string;

	@Expose()
	@ApiProperty({
		example: "https://store.steampowered.com/app/271590/Grand_Theft_Auto_V/",
	})
	url: string;
}

@Exclude()
export class GameExtrasResponseDto {
	@Expose()
	@ApiProperty({
		example: ["https://media.rawg.io/media/screenshots/abc.jpg"],
		type: [String],
	})
	screenshots: string[];

	@Expose()
	@Type(() => StoreLinkResponseDto)
	@ApiProperty({ type: [StoreLinkResponseDto] })
	stores: StoreLinkResponseDto[];

	@Expose()
	@Type(() => GameSearchResultResponseDto)
	@ApiProperty({ type: [GameSearchResultResponseDto] })
	similar: GameSearchResultResponseDto[];
}
