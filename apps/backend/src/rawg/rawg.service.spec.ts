import type { Mock } from "vitest";
import { HttpStatus, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { RawgService } from "./rawg.service";

const okResponse = (data: unknown) =>
	({ ok: true, status: 200, json: async () => data }) as Response;

const errorResponse = (status: number, statusText: string) =>
	({ ok: false, status, statusText }) as Response;

/* The URL fetch was last called with, minus the trailing API key */
const requestedUrl = (fetchMock: Mock) => {
	const url: string = fetchMock.mock.lastCall?.[0];
	expect(url).toMatch(/[?&]key=test-api-key$/);
	return url.replace(/[?&]key=test-api-key$/, "");
};

describe("RawgService", () => {
	let service: RawgService;
	let fetchMock: Mock;
	let configService: Partial<ConfigService>;

	beforeAll(() => {
		vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
		vi.spyOn(Logger.prototype, "error").mockImplementation(() => {});
	});

	beforeEach(() => {
		fetchMock = vi.fn();
		global.fetch = fetchMock;
		configService = {
			get: vi.fn().mockReturnValue("test-api-key"),
		};

		service = new RawgService(configService as ConfigService);
	});

	it("should throw error if API key is missing", () => {
		configService.get = vi.fn().mockReturnValue(undefined);

		expect(() => new RawgService(configService as ConfigService)).toThrow(
			"RAWG_API_KEY is not configured",
		);
	});

	it("should fetch from RAWG and return data on success", async () => {
		const mockData = { results: [{ id: 1, name: "Game 1" }] };
		fetchMock.mockResolvedValue(okResponse(mockData));

		const result = await service.searchGames("zelda");

		expect(requestedUrl(fetchMock)).toBe(
			"https://api.rawg.io/api/games?search=zelda&page=1&page_size=20",
		);
		expect(result).toEqual(mockData);
	});

	it("should forward the requested search page", async () => {
		const mockData = { results: [] };
		fetchMock.mockResolvedValue(okResponse(mockData));

		await service.searchGames("zelda", 3);

		expect(requestedUrl(fetchMock)).toBe(
			"https://api.rawg.io/api/games?search=zelda&page=3&page_size=20",
		);
	});

	it("should request popular games scoped to the last year", async () => {
		vi.useFakeTimers().setSystemTime(new Date("2026-06-12T12:00:00Z"));

		const mockData = { results: [{ id: 1, name: "Game 1" }] };
		fetchMock.mockResolvedValue(okResponse(mockData));

		const result = await service.getPopularGames();

		expect(requestedUrl(fetchMock)).toBe(
			"https://api.rawg.io/api/games?dates=2025-06-12,2026-06-12&ordering=-added&page=1&page_size=20",
		);
		expect(result).toEqual(mockData);

		vi.useRealTimers();
	});

	it("should request screenshots for a game", async () => {
		const mockData = { results: [{ id: 1, image: "a.jpg" }] };
		fetchMock.mockResolvedValue(okResponse(mockData));

		const result = await service.getScreenshots("123");

		expect(requestedUrl(fetchMock)).toBe(
			"https://api.rawg.io/api/games/123/screenshots",
		);
		expect(result).toEqual(mockData);
	});

	it("should request stores for a game", async () => {
		const mockData = {
			results: [{ id: 1, store_id: 1, url: "https://steam" }],
		};
		fetchMock.mockResolvedValue(okResponse(mockData));

		const result = await service.getStores("123");

		expect(requestedUrl(fetchMock)).toBe(
			"https://api.rawg.io/api/games/123/stores",
		);
		expect(result).toEqual(mockData);
	});

	it("should request suggested games from the game-series endpoint", async () => {
		const mockData = { results: [{ id: 1, name: "Sequel" }] };
		fetchMock.mockResolvedValue(okResponse(mockData));

		const result = await service.getSuggestedGames("123");

		expect(requestedUrl(fetchMock)).toBe(
			"https://api.rawg.io/api/games/123/game-series?page_size=12",
		);
		expect(result).toEqual(mockData);
	});

	it("should throw UNAUTHORIZED HttpException on 401 error", async () => {
		fetchMock.mockResolvedValue(errorResponse(401, "Unauthorized"));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.UNAUTHORIZED,
			response: "Invalid RAWG API key",
		});
	});

	it("should throw TOO_MANY_REQUESTS HttpException on 429 error", async () => {
		fetchMock.mockResolvedValue(errorResponse(429, "Too Many Requests"));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.TOO_MANY_REQUESTS,
			response: "RAWG API rate limit exceeded",
		});
	});

	it("should throw SERVICE_UNAVAILABLE HttpException on other errors", async () => {
		fetchMock.mockResolvedValue(errorResponse(500, "Unknown error"));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.SERVICE_UNAVAILABLE,
			response: "Failed to fetch data from RAWG API",
		});
	});

	it("should throw SERVICE_UNAVAILABLE HttpException on network failure", async () => {
		fetchMock.mockRejectedValue(new TypeError("fetch failed"));

		await expect(service.searchGames("zelda")).rejects.toMatchObject({
			status: HttpStatus.SERVICE_UNAVAILABLE,
			response: "Failed to fetch data from RAWG API",
		});
	});

	it("should pass a timeout signal to fetch", async () => {
		fetchMock.mockResolvedValue(okResponse({ results: [] }));

		await service.searchGames("zelda");

		expect(fetchMock.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
	});
});
