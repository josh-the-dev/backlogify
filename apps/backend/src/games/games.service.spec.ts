import { GameSearchResult } from "@backlogify/types";
import { Logger } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { RawgService } from "../rawg/rawg.service";
import { GamesService } from "./games.service";

describe("GamesService", () => {
	let service: GamesService;

	// Create a spy/mock for Logger methods
	const loggerLogSpy = jest
		.spyOn(Logger.prototype, "log")
		.mockImplementation(() => {});
	const loggerErrorSpy = jest
		.spyOn(Logger.prototype, "error")
		.mockImplementation(() => {});

	const mockRawgService = {
		searchGames: jest.fn(),
		getGameDetails: jest.fn(),
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
				"Failed to search games",
				error.stack,
			);
		});
	});

	describe("getGameDetails", () => {
		it("should log and return mapped game details correctly", async () => {
			const id = "123";
			const rawgGame = {
				id: 123,
				name: "Elden Ring",
				description: "<p>An epic open-world RPG</p>",
				released: "2022-02-25",
				background_image: "https://example.com/eldenring.jpg",
				genres: [
					{ id: 1, name: "RPG" },
					{ id: 2, name: "Action" },
				],
				platforms: [
					{ platform: { id: 1, name: "PC" } },
					{ platform: { id: 2, name: "PlayStation 5" } },
				],
			};

			mockRawgService.getGameDetails = jest.fn().mockResolvedValue(rawgGame);

			const result = await service.getGameDetails(id);

			expect(mockRawgService.getGameDetails).toHaveBeenCalledWith(id);

			expect(result).toEqual({
				id: 123,
				name: "Elden Ring",
				description: "<p>An epic open-world RPG</p>",
				releaseDate: "2022-02-25",
				coverUrl: "https://example.com/eldenring.jpg",
				genres: ["RPG", "Action"],
				platforms: ["PC", "PlayStation 5"],
			});

			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Fetching game details for ID: "${id}"`,
			);
		});
		it("should handle missing fields gracefully", async () => {
			const id = "456";
			const rawgGame = {
				id: 456,
				name: "Mystery Game",
				description: null,
				released: null,
				background_image: undefined,
				genres: [],
				platforms: [],
			};

			mockRawgService.getGameDetails = jest.fn().mockResolvedValue(rawgGame);

			const result = await service.getGameDetails(id);

			expect(result).toEqual({
				id: 456,
				name: "Mystery Game",
				description: null,
				releaseDate: null,
				coverUrl: null,
				genres: [],
				platforms: [],
			});
		});

		it("should log error and re-throw when RawgService fails", async () => {
			const id = "999";
			const error = new Error("RAWG details fetch failed");

			mockRawgService.getGameDetails = jest.fn().mockRejectedValue(error);

			await expect(service.getGameDetails(id)).rejects.toThrow(error);

			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Fetching game details for ID: "${id}"`,
			);
			expect(loggerErrorSpy).toHaveBeenCalledWith(
				"Failed to fetch game details",
				error.stack,
			);
		});
	});
});
