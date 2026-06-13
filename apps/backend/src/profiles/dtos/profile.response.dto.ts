import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";

@Exclude()
export class ProfileResponseDto {
	@Expose()
	@ApiProperty({ example: "ada-lovelace" })
	username: string;

	@Expose()
	@ApiProperty({ example: true })
	isPublic: boolean;
}
