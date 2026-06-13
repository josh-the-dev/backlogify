import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, Type } from "class-transformer";
import { PublicGameResponseDto } from "./public-game.response.dto";

@Exclude()
export class PublicBacklogResponseDto {
	@Expose()
	@ApiProperty({ example: "ada-lovelace" })
	username: string;

	@Expose()
	@Type(() => PublicGameResponseDto)
	@ApiProperty({ type: [PublicGameResponseDto] })
	games: PublicGameResponseDto[];
}
