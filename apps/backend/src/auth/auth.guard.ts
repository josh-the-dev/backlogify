import { verifyToken } from "@clerk/backend";
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
	private secretKey: string;

	constructor(private configService: ConfigService) {
		this.secretKey = this.configService.get<string>("CLERK_SECRET_KEY")!;
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<Request>();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException("No token provided");
		}

		try {
			const payload = await verifyToken(token, {
				secretKey: this.secretKey,
			});
			request["userId"] = payload.sub;
			return true;
		} catch {
			throw new UnauthorizedException("Invalid token");
		}
	}

	private extractTokenFromHeader(request: Request): string | undefined {
		const [type, token] = request.headers.authorization?.split(" ") ?? [];
		return type === "Bearer" ? token : undefined;
	}
}
