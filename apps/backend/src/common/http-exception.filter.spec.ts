import { ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { AllExceptionsFilter } from "./http-exception.filter";

function makeHost(method = "GET", url = "/test"): { host: ArgumentsHost; json: jest.Mock; status: jest.Mock } {
	const json = jest.fn();
	const status = jest.fn().mockReturnValue({ json });
	const host = {
		switchToHttp: () => ({
			getResponse: () => ({ status }),
			getRequest: () => ({ method, url }),
		}),
	} as unknown as ArgumentsHost;
	return { host, json, status };
}

describe("AllExceptionsFilter", () => {
	let filter: AllExceptionsFilter;

	beforeEach(() => {
		filter = new AllExceptionsFilter();
		jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
		jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
	});

	afterEach(() => jest.restoreAllMocks());

	describe("HttpException handling", () => {
		it("returns the correct status code and string message", () => {
			const { host, status, json } = makeHost();
			filter.catch(new HttpException("Not found", HttpStatus.NOT_FOUND), host);

			expect(status).toHaveBeenCalledWith(404);
			expect(json).toHaveBeenCalledWith({ statusCode: 404, message: "Not found" });
		});

		it("passes through an object response from HttpException as-is", () => {
			const { host, status, json } = makeHost();
			const body = { statusCode: 400, message: ["name must not be empty"], error: "Bad Request" };
			filter.catch(new HttpException(body, HttpStatus.BAD_REQUEST), host);

			expect(status).toHaveBeenCalledWith(400);
			expect(json).toHaveBeenCalledWith(body);
		});

		it("wraps an array message in statusCode + message shape", () => {
			const { host, status, json } = makeHost();
			filter.catch(new HttpException(["field is required"], HttpStatus.UNPROCESSABLE_ENTITY), host);

			expect(status).toHaveBeenCalledWith(422);
			expect(json).toHaveBeenCalledWith({ statusCode: 422, message: ["field is required"] });
		});
	});

	describe("non-HttpException handling", () => {
		it("masks the error and returns 500 with a generic message", () => {
			const { host, status, json } = makeHost("POST", "/user-games");
			filter.catch(new Error("DB connection refused"), host);

			expect(status).toHaveBeenCalledWith(500);
			expect(json).toHaveBeenCalledWith({ statusCode: 500, message: "Internal server error" });
		});

		it("masks non-Error throws (e.g. thrown strings) the same way", () => {
			const { host, status, json } = makeHost();
			filter.catch("something went wrong", host);

			expect(status).toHaveBeenCalledWith(500);
			expect(json).toHaveBeenCalledWith({ statusCode: 500, message: "Internal server error" });
		});

		it("logs the unhandled exception for 500 errors", () => {
			const errorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
			const { host } = makeHost("GET", "/games");
			filter.catch(new Error("unexpected"), host);

			expect(errorSpy).toHaveBeenCalledTimes(1);
			expect(errorSpy.mock.calls[0][0]).toContain("GET /games");
		});
	});
});
