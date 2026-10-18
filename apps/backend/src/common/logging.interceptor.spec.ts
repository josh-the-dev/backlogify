import type { MockInstance } from "vitest";
import { CallHandler, ExecutionContext, Logger } from "@nestjs/common";
import { lastValueFrom, of } from "rxjs";
import { LoggingInterceptor } from "./logging.interceptor";

function makeContext(
	method: string,
	url: string,
	statusCode: number,
	correlationId?: string,
): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => ({ method, url, correlationId }),
			getResponse: () => ({ statusCode }),
		}),
	} as unknown as ExecutionContext;
}

function makeCallHandler(value: unknown = {}): CallHandler {
	return { handle: () => of(value) };
}

describe("LoggingInterceptor", () => {
	let interceptor: LoggingInterceptor;
	let logSpy: MockInstance;

	beforeEach(() => {
		interceptor = new LoggingInterceptor();
		logSpy = vi
			.spyOn(Logger.prototype, "log")
			.mockImplementation(() => undefined);
	});

	afterEach(() => vi.restoreAllMocks());

	it("passes the response value through unchanged", async () => {
		const ctx = makeContext("GET", "/games", 200);
		const handler = makeCallHandler({ id: 1 });

		const value = await lastValueFrom(interceptor.intercept(ctx, handler));

		expect(value).toEqual({ id: 1 });
	});

	it("logs [correlationId] METHOD URL STATUS - Xms after the handler completes", async () => {
		const ctx = makeContext("POST", "/user-games", 201, "abc-123");
		const handler = makeCallHandler();

		await lastValueFrom(interceptor.intercept(ctx, handler));

		expect(logSpy).toHaveBeenCalledTimes(1);
		const message: string = logSpy.mock.calls[0][0];
		expect(message).toMatch(/^\[abc-123\] POST \/user-games 201 - \d+ms$/);
	});

	it("uses - as the correlation ID placeholder when not set", async () => {
		const ctx = makeContext("GET", "/health", 200);
		const handler = makeCallHandler();

		await lastValueFrom(interceptor.intercept(ctx, handler));

		const message: string = logSpy.mock.calls[0][0];
		expect(message).toMatch(/^\[-\]/);
	});

	it("logs the correct status code from the response object", async () => {
		const ctx = makeContext("DELETE", "/user-games/123", 204);
		const handler = makeCallHandler();

		await lastValueFrom(interceptor.intercept(ctx, handler));

		const message: string = logSpy.mock.calls[0][0];
		expect(message).toContain("204");
	});
});
