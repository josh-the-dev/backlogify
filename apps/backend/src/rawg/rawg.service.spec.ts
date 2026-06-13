import type { HttpService } from "@nestjs/axios";
import { HttpStatus, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { of, throwError } from "rxjs";
import { RawgService } from "./rawg.service";

describe("RawgService", () => {
	let service: RawgService;
	let httpService: Partial<HttpService>;
	let configService: Partial<ConfigService>;

	beforeAll(() => {
		jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});
		jest.spyOn(Logger.prototype, "error").mockImplementation(() => {});
	});

	beforeEach(() => {
		httpService = {
			get: jest.fn(),
		};
		configService = {
			get: jest.fn().mockReturnValue("test-api-key"),
		};

		service = new RawgService(
			httpService as HttpService,
			configService as ConfigService,
		);
	});

	it("should throw error if API key is missing", () => {
		configService.get = jest.fn().mockReturnValue(undefined);

		expect(
			() =>
				new RawgService(
					httpService as HttpService,
					configService as ConfigService,
				),
		).toThrow("RAWG_API_KEY is not configured");
	});

	it("should call httpService.get and return data on success", async () => {
		const mockResponse = { data: { results: [{ id: 1, name: "Game 1" }] } };
		(httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

		const result = await service.searchGames("zelda");

		expect(httpService.get).toHaveBeenCalledWith(
			"https://api.rawg.io/api/games?search=zelda&page=1&page_size=20",
			{ params: { key: "test-api-key" } },
		);
		expect(result).toEqual(mockResponse.data);
	});

	it("should forward the requested search page", async () => {
		const mockResponse = { data: { results: [] } };
		(httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

		await service.searchGames("zelda", 3);

		expect(httpService.get).toHaveBeenCalledWith(
			"https://api.rawg.io/api/games?search=zelda&page=3&page_size=20",
			{ params: { key: "test-api-key" } },
		);
	});

	it("should request popular games scoped to the last year", async () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-06-12T12:00:00Z"));

		const mockResponse = { data: { results: [{ id: 1, name: "Game 1" }] } };
		(httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

		const result = await service.getPopularGames();

		expect(httpService.get).toHaveBeenCalledWith(
			"https://api.rawg.io/api/games?dates=2025-06-12,2026-06-12&ordering=-added&page=1&page_size=20",
			{ params: { key: "test-api-key" } },
		);
		expect(result).toEqual(mockResponse.data);

		jest.useRealTimers();
	});

	it("should request screenshots for a game", async () => {
		const mockResponse = { data: { results: [{ id: 1, image: "a.jpg" }] } };
		(httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

		const result = await service.getScreenshots("123");

		expect(httpService.get).toHaveBeenCalledWith(
			"https://api.rawg.io/api/games/123/screenshots",
			{ params: { key: "test-api-key" } },
		);
		expect(result).toEqual(mockResponse.data);
	});

	it("should request stores for a game", async () => {
		const mockResponse = {
			data: { results: [{ id: 1, store_id: 1, url: "https://steam" }] },
		};
		(httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

		const result = await service.getStores("123");

		expect(httpService.get).toHaveBeenCalledWith(
			"https://api.rawg.io/api/games/123/stores",
			{ params: { key: "test-api-key" } },
		);
		expect(result).toEqual(mockResponse.data);
	});

	it("should request suggested games from the game-series endpoint", async () => {
		const mockResponse = { data: { results: [{ id: 1, name: "Sequel" }] } };
		(httpService.get as jest.Mock).mockReturnValue(of(mockResponse));

		const result = await service.getSuggestedGames("123");

		expect(httpService.get).toHaveBeenCalledWith(
			"https://api.rawg.io/api/games/123/game-series?page_size=12",
			{ params: { key: "test-api-key" } },
		);
		expect(result).toEqual(mockResponse.data);
	});

	it("should throw UNAUTHORIZED HttpException on 401 error", async () => {
		const error = {
			message: "Unauthorized",
			response: { status: 401 },
			stack: "stack trace",
		};
		(httpService.get as jest.Mock).mockReturnValue(throwError(() => error));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
			response: "Invalid RAWG API key",
		});
	});

	it("should throw TOO_MANY_REQUESTS HttpException on 429 error", async () => {
		const error = {
			message: "Too Many Requests",
			response: { status: 429 },
			stack: "stack trace",
		};
		(httpService.get as jest.Mock).mockReturnValue(throwError(() => error));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.TOO_MANY_REQUESTS,
			response: "RAWG API rate limit exceeded",
		});
	});

	it("should throw SERVICE_UNAVAILABLE HttpException on other errors", async () => {
		const error = {
			message: "Unknown error",
			response: { status: 500 },
			stack: "stack trace",
		};
		(httpService.get as jest.Mock).mockReturnValue(throwError(() => error));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.SERVICE_UNAVAILABLE,
			response: "Failed to fetch data from RAWG API",
		});
	});
});
