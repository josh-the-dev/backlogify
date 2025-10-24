import { Logger } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { RawgService } from "../rawg/rawg.service";
import { GamesService } from "./games.service";
import type { GameSearchResult } from "./interfaces/games.interface";

describe("GamesService", () => {
	let service: GamesService;
	let rawgService: RawgService;

	// Create a spy/mock for Logger methods
	const loggerLogSpy = jest
		.spyOn(Logger.prototype, "log")
		.mockImplementation(() => {});
	const loggerErrorSpy = jest
		.spyOn(Logger.prototype, "error")
		.mockImplementation(() => {});

	const mockRawgService = {
		searchGames: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				GamesService,
				{
					provide: RawgService,
					useValue: mockRawgService,
				},
			],
		}).compile();

		service = module.get<GamesService>(GamesService);
		rawgService = module.get<RawgService>(RawgService);

		jest.clearAllMocks();
	});

	describe("search", () => {
		it("should log and return mapped game results", async () => {
			const query = "witcher";
			const rawgResponse = {
				results: [
					{
						id: 1,
						name: "The Witcher 3: Wild Hunt",
						background_image: "https://example.com/witcher3.jpg",
					},
					{
						id: 2,
						name: "The Witcher 2",
						background_image: null,
					},
				],
			};

			mockRawgService.searchGames.mockResolvedValue(rawgResponse);

			const result = await service.search(query);

			expect(result).toEqual<GameSearchResult[]>([
				{
					id: 1,
					name: "The Witcher 3: Wild Hunt",
					coverUrl: "https://example.com/witcher3.jpg",
				},
				{
					id: 2,
					name: "The Witcher 2",
					coverUrl: null,
				},
			]);

			expect(mockRawgService.searchGames).toHaveBeenCalledWith(query);
			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Searching games for query: "${query}"`,
			);
		});

		it("should convert undefined or empty background_image to null", async () => {
			const query = "test-game";
			const rawgResponse = {
				results: [
					{ id: 3, name: "Game A", background_image: undefined },
					{ id: 4, name: "Game B", background_image: "" },
				],
			};

			mockRawgService.searchGames.mockResolvedValue(rawgResponse);

			const result = await service.search(query);

			expect(result).toEqual([
				{ id: 3, name: "Game A", coverUrl: null },
				{ id: 4, name: "Game B", coverUrl: null },
			]);
		});

		it("should return empty array for no results", async () => {
			const query = "empty-search";
			const rawgResponse = { results: [] };
			mockRawgService.searchGames.mockResolvedValue(rawgResponse);

			const result = await service.search(query);

			expect(result).toEqual([]);
			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Searching games for query: "${query}"`,
			);
		});

		it("should log error and re-throw if rawgService.searchGames fails", async () => {
			const query = "fail-test";
			const error = new Error("RAWG API failure");
			mockRawgService.searchGames.mockRejectedValue(error);

			await expect(service.search(query)).rejects.toThrow(error);

			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Searching games for query: "${query}"`,
			);
			expect(loggerErrorSpy).toHaveBeenCalledWith(
				`Failed to search games: ${error.message}`,
				error.stack,
			);
		});
	});
});
