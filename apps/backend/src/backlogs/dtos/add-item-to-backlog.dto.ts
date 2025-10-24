import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class AddItemToBacklogDto {
	@IsNumber()
	externalServiceId: number;

	@IsString()
	@IsNotEmpty()
	name: string;

	@IsOptional()
	@IsString()
	coverUrl?: string;
}
