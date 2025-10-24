import { BadRequestException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { GamesController } from "./games.controller";
import { GamesService } from "./games.service";

describe("GamesController", () => {
	let controller: GamesController;
	let service: GamesService;

	const mockGamesService = {
		search: jest.fn(),
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
		service = module.get<GamesService>(GamesService);
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

			const result = await controller.search(query);

			expect(result).toEqual(expectedResults);
			expect(mockGamesService.search).toHaveBeenCalledWith("witcher");
			expect(mockGamesService.search).toHaveBeenCalledTimes(1);
		});

		it("should trim whitespace from query", async () => {
			const query = "  witcher  ";
			const expectedResults = [{ id: 1, name: "Game", coverUrl: null }];

			mockGamesService.search.mockResolvedValue(expectedResults);

			await controller.search(query);

			expect(mockGamesService.search).toHaveBeenCalledWith("witcher");
		});

		it("should throw BadRequestException for empty query", async () => {
			await expect(controller.search("")).rejects.toThrow(BadRequestException);
			await expect(controller.search("")).rejects.toThrow(
				"Search query is required",
			);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for whitespace-only query", async () => {
			await expect(controller.search("   ")).rejects.toThrow(
				BadRequestException,
			);
			await expect(controller.search("   ")).rejects.toThrow(
				"Search query is required",
			);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should throw BadRequestException for undefined query", async () => {
			await expect(controller.search(undefined as any)).rejects.toThrow(
				BadRequestException,
			);

			expect(mockGamesService.search).not.toHaveBeenCalled();
		});

		it("should propagate service errors", async () => {
			const query = "test";
			const serviceError = new Error("Service unavailable");

			mockGamesService.search.mockRejectedValue(serviceError);

			await expect(controller.search(query)).rejects.toThrow(
				"Service unavailable",
			);
			expect(mockGamesService.search).toHaveBeenCalledWith("test");
		});
	});
});
