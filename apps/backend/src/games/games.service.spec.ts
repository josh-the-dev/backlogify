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
		getPopularGames: jest.fn(),
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
						released: "2015-05-18",
						metacritic: 92,
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
					releaseDate: "2015-05-18",
					metacritic: 92,
				},
				{
					id: 2,
					name: "The Witcher 2",
					coverUrl: null,
					releaseDate: null,
					metacritic: null,
				},
			]);

			expect(mockRawgService.searchGames).toHaveBeenCalledWith(query, 1);
			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Searching games for query: "${query}" (page 1)`,
			);
		});

		it("should forward the requested page to RawgService", async () => {
			mockRawgService.searchGames.mockResolvedValue({ results: [] });

			await service.search("witcher", 4);

			expect(mockRawgService.searchGames).toHaveBeenCalledWith("witcher", 4);
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
				{ id: 3, name: "Game A", coverUrl: null, releaseDate: null, metacritic: null },
				{ id: 4, name: "Game B", coverUrl: null, releaseDate: null, metacritic: null },
			]);
		});

		it("should return empty array for no results", async () => {
			const query = "empty-search";
			const rawgResponse = { results: [] };
			mockRawgService.searchGames.mockResolvedValue(rawgResponse);

			const result = await service.search(query);

			expect(result).toEqual([]);
			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Searching games for query: "${query}" (page 1)`,
			);
		});

		it("should log error and re-throw if rawgService.searchGames fails", async () => {
			const query = "fail-test";
			const error = new Error("RAWG API failure");
			mockRawgService.searchGames.mockRejectedValue(error);

			await expect(service.search(query)).rejects.toThrow(error);

			expect(loggerLogSpy).toHaveBeenCalledWith(
				`Searching games for query: "${query}" (page 1)`,
			);
			expect(loggerErrorSpy).toHaveBeenCalledWith(
				"Failed to search games",
				error.stack,
			);
		});
	});

	describe("getPopularGames", () => {
		it("should log and return mapped popular games", async () => {
			const rawgResponse = {
				results: [
					{
						id: 3328,
						name: "The Witcher 3: Wild Hunt",
						background_image: "https://example.com/witcher3.jpg",
						released: "2015-05-18",
						metacritic: 92,
					},
				],
			};

			mockRawgService.getPopularGames.mockResolvedValue(rawgResponse);

			const result = await service.getPopularGames();

			expect(result).toEqual([
				{
					id: 3328,
					name: "The Witcher 3: Wild Hunt",
					coverUrl: "https://example.com/witcher3.jpg",
					releaseDate: "2015-05-18",
					metacritic: 92,
				},
			]);
			expect(loggerLogSpy).toHaveBeenCalledWith(
				"Fetching popular games (page 1)",
			);
		});

		it("should forward the requested page to RawgService", async () => {
			mockRawgService.getPopularGames.mockResolvedValue({ results: [] });

			await service.getPopularGames(2);

			expect(mockRawgService.getPopularGames).toHaveBeenCalledWith(2);
		});

		it("should log error and re-throw if rawgService.getPopularGames fails", async () => {
			const error = new Error("RAWG API failure");
			mockRawgService.getPopularGames.mockRejectedValue(error);

			await expect(service.getPopularGames()).rejects.toThrow(error);

			expect(loggerErrorSpy).toHaveBeenCalledWith(
				"Failed to fetch popular games",
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
