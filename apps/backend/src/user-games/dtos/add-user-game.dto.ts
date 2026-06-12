import { GameStatus } from "@backlogify/types";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AddUserGameDto {
	@ApiProperty({ example: "3498" })
	@IsString()
	@IsNotEmpty()
	externalServiceId: string;

	@ApiProperty({ example: "Grand Theft Auto V" })
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiPropertyOptional({ example: "https://media.rawg.io/media/games/456/456dea5e1c7e3cd07060c14e96612001.jpg" })
	@IsOptional()
	@IsString()
	coverUrl?: string;

	@ApiProperty({
		enum: ["backlog", "playing", "played", "abandoned"],
		example: "backlog",
	})
	@IsIn(["backlog", "playing", "played", "abandoned"])
	status: GameStatus;
}
