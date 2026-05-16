import { CallHandler, ExecutionContext, Logger } from "@nestjs/common";
import { of } from "rxjs";
import { LoggingInterceptor } from "./logging.interceptor";

function makeContext(method: string, url: string, statusCode: number): ExecutionContext {
	return {
		switchToHttp: () => ({
			getRequest: () => ({ method, url }),
			getResponse: () => ({ statusCode }),
		}),
	} as unknown as ExecutionContext;
}

function makeCallHandler(value: unknown = {}): CallHandler {
	return { handle: () => of(value) };
}

describe("LoggingInterceptor", () => {
	let interceptor: LoggingInterceptor;
	let logSpy: jest.SpyInstance;

	beforeEach(() => {
		interceptor = new LoggingInterceptor();
		logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
	});

	afterEach(() => jest.restoreAllMocks());

	it("passes the response value through unchanged", (done) => {
		const ctx = makeContext("GET", "/games", 200);
		const handler = makeCallHandler({ id: 1 });

		interceptor.intercept(ctx, handler).subscribe({
			next: (value) => {
				expect(value).toEqual({ id: 1 });
				done();
			},
		});
	});

	it("logs METHOD URL STATUS - Xms after the handler completes", (done) => {
		const ctx = makeContext("POST", "/user-games", 201);
		const handler = makeCallHandler();

		interceptor.intercept(ctx, handler).subscribe({
			complete: () => {
				expect(logSpy).toHaveBeenCalledTimes(1);
				const message: string = logSpy.mock.calls[0][0];
				expect(message).toMatch(/^POST \/user-games 201 - \d+ms$/);
				done();
			},
		});
	});

	it("logs the correct status code from the response object", (done) => {
		const ctx = makeContext("DELETE", "/user-games/123", 204);
		const handler = makeCallHandler();

		interceptor.intercept(ctx, handler).subscribe({
			complete: () => {
				const message: string = logSpy.mock.calls[0][0];
				expect(message).toContain("204");
				done();
			},
		});
	});
});
