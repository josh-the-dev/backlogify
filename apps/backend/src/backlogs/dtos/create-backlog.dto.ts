import { IsString, Length } from "class-validator";

export class CreateBacklogDto {
	@IsString()
	@Length(1, 100)
	name: string;
}
