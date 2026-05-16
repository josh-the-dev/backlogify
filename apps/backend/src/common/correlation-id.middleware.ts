import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		const correlationId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
		(req as Request & { correlationId: string }).correlationId = correlationId;
		res.setHeader("X-Request-ID", correlationId);
		next();
	}
}
