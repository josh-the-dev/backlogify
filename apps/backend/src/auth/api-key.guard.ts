import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class ApiKeyGuard implements CanActivate {
	private apiKey: string;

	constructor(private configService: ConfigService) {
		const key = this.configService.get<string>("API_KEY");
		if (!key) {
			throw new Error("API_KEY environment variable is required");
		}
		this.apiKey = key;
	}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<Request>();
		const providedKey = request.headers["x-api-key"];

		if (!providedKey) {
			throw new UnauthorizedException("API key is required");
		}

		if (providedKey !== this.apiKey) {
			throw new UnauthorizedException("Invalid API key");
		}

		return true;
	}
}
