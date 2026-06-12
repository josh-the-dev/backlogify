import { BadRequestException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";

describe("GamesController", () => {
	let controller: GamesController;
	let _service: GamesService;

	const mockGamesService = {
		search: jest.fn(),
		getPopularGames: jest.fn(),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [GamesController],
			providers: [
				{
					provide: GamesService,
					useValue: mockGamesService,
				},
			],
		}).compile();

		controller = module.get<GamesController>(GamesController);
		_service = module.get<GamesService>(GamesService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe("search", () => {
		it("should return search results for valid query", async () => {
			const query = "witcher";
			const expectedResults = [
				{
					id: 1,
					name: "The Witcher 3: Wild Hunt",
					coverUrl: "https://example.com/witcher3.jpg",
				},
			];

			mockGamesService.search.mockResolvedValue(expectedResults);

			const result = await controller.search(query, 1);

			expect(result).toEqual(expectedResults);
			expect(mockGamesService.search).toHaveBeenCalledWith("witcher", 1);
			expect(mockGamesService.search).toHaveBeenCalledTimes(1);
		});

		it("should trim whitespace from query", async () => {
			const query = "  witcher  ";
			const expectedResults = [{ id: 1, name: "Game", coverUrl: null }];

			mockGamesService.search.mockResolvedValue(expectedResults);

			await controller.search(query, 1);

			expect(mockGamesService.search).toHaveBeenCalledWith("witcher", 1);
		});

		it("should forward the requested page to the service", async () => {
			mockGamesService.search.mockResolvedValue([]);

			await controller.search("witcher", 3);

			expect(mockGamesService.search).toHaveBeenCalledWith("witcher", 3);
		});

		it("should default to page 1 when page is omitted", async () => {
			mockGamesService.search.mockResolvedValue([]);

			await controller.search("witcher", undefined);

			expect(mockGamesService.search).toHaveBeenCalledWith("witcher", 1);
		});

		it("should throw BadRequestException for empty query", async () => {
			await expect(controller.search("", 1)).rejects.toThrow(
				BadRequestException,
			);
			await expect(controller.search("", 1)).rejects.toThrow(
				"Search query is required",
			);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for whitespace-only query", async () => {
			await expect(controller.search("   ", 1)).rejects.toThrow(
				BadRequestException,
			);
			await expect(controller.search("   ", 1)).rejects.toThrow(
				"Search query is required",
			);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for undefined query", async () => {
			await expect(
				controller.search(undefined as unknown as string, 1),
			).rejects.toThrow(BadRequestException);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for a page below 1", async () => {
			await expect(controller.search("witcher", 0)).rejects.toThrow(
				"Page must be at least 1",
			);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should return popular games", async () => {
			const expectedResults = [
				{
					id: 1,
					name: "The Witcher 3: Wild Hunt",
					coverUrl: "https://example.com/witcher3.jpg",
					releaseDate: "2015-05-18",
					metacritic: 92,
				},
			];

			mockGamesService.getPopularGames.mockResolvedValue(expectedResults);

			const result = await controller.getPopularGames(1);

			expect(result).toEqual(expectedResults);
			expect(mockGamesService.getPopularGames).toHaveBeenCalledWith(1);
			expect(mockGamesService.getPopularGames).toHaveBeenCalledTimes(1);
		});

		it("should throw BadRequestException for a popular page below 1", async () => {
			await expect(controller.getPopularGames(0)).rejects.toThrow(
				"Page must be at least 1",
			);

			expect(mockGamesService.getPopularGames).not.toHaveBeenCalled();
		});

		it("should propagate service errors", async () => {
			const query = "test";
			const serviceError = new Error("Service unavailable");

			mockGamesService.search.mockRejectedValue(serviceError);

			await expect(controller.search(query, 1)).rejects.toThrow(
				"Service unavailable",
			);
			expect(mockGamesService.search).toHaveBeenCalledWith("test", 1);
		});
	});
});
