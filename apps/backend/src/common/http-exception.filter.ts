import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	HttpStatus,
	Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const message =
			exception instanceof HttpException
				? exception.getResponse()
				: "Internal server error";

		if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
			this.logger.error(
				`Unhandled exception on ${request.method} ${request.url}`,
				exception instanceof Error ? exception.stack : String(exception),
			);
		}

		response.status(status).json(
			typeof message === "string" || Array.isArray(message)
				? { statusCode: status, message }
				: message,
		);
	}
}
