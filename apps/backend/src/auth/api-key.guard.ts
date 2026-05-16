import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "./public.decorator";

@Injectable()
export class ApiKeyGuard implements CanActivate {
	private apiKey: string;

	constructor(
		private configService: ConfigService,
		private reflector: Reflector,
	) {
		const key = this.configService.get<string>("API_KEY");
		if (!key) {
			throw new Error("API_KEY environment variable is required");
		}
		this.apiKey = key;
	}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);
		if (isPublic) return true;

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
