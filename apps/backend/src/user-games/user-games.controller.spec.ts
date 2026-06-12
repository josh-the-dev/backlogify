import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { ClerkAuthGuard } from "../auth";
import { PaginationDto } from "./dtos/pagination.dto";
import { UserGamesController } from "./user-games.controller";
import { UserGamesService } from "./user-games.service";

describe("UserGamesController", () => {
	let controller: UserGamesController;

	const mockUserGamesService = {
		getAll: jest.fn(),
		add: jest.fn(),
		update: jest.fn(),
		remove: jest.fn(),
	};

	const mockClerkAuthGuard = {
		canActivate: jest.fn().mockReturnValue(true),
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [UserGamesController],
			providers: [
				{
					provide: UserGamesService,
					useValue: mockUserGamesService,
				},
			],
		})
			.overrideGuard(ClerkAuthGuard)
			.useValue(mockClerkAuthGuard)
			.compile();

		controller = module.get<UserGamesController>(UserGamesController);

		jest.clearAllMocks();
	});

	describe("getAll", () => {
		it("should return all games for a user", () => {
			const userId = "user-1";
			const expectedGames = [
				{
					id: "game-1",
					userId: "user-1",
					externalServiceId: "ext-1",
					name: "The Witcher 3",
					coverUrl: "https://example.com/witcher3.jpg",
					status: "backlog",
					addedAt: new Date(),
				},
				{
					id: "game-2",
					userId: "user-1",
					externalServiceId: "ext-2",
					name: "Elden Ring",
					coverUrl: null,
					status: "playing",
					addedAt: new Date(),
				},
			];

			mockUserGamesService.getAll.mockReturnValue(expectedGames);

			const pagination: PaginationDto = { limit: 50, offset: 0 };
			const result = controller.getAll(userId, pagination);

			expect(result).toEqual(expectedGames);
			expect(mockUserGamesService.getAll).toHaveBeenCalledWith(
				userId,
				pagination,
			);
			expect(mockUserGamesService.getAll).toHaveBeenCalledTimes(1);
		});

		it("should return empty array when user has no games", () => {
			mockUserGamesService.getAll.mockReturnValue([]);

			const result = controller.getAll("user-1", { limit: 50, offset: 0 });

			expect(result).toEqual([]);
		});
	});

	describe("addGame", () => {
		it("should add a game and return the created game", () => {
			const userId = "user-1";
			const dto = {
				externalServiceId: "ext-123",
				name: "Cyberpunk 2077",
				coverUrl: "https://example.com/cyberpunk.jpg",
				status: "backlog" as const,
			};
			const expectedGame = {
				id: "game-id",
				userId,
				...dto,
				addedAt: new Date(),
			};

			mockUserGamesService.add.mockReturnValue(expectedGame);

			const result = controller.addGame(userId, dto);

			expect(result).toEqual(expectedGame);
			expect(mockUserGamesService.add).toHaveBeenCalledWith(userId, dto);
			expect(mockUserGamesService.add).toHaveBeenCalledTimes(1);
		});

		it("should add a game without coverUrl", () => {
			const userId = "user-1";
			const dto = {
				externalServiceId: "ext-456",
				name: "Hollow Knight",
				status: "playing" as const,
			};
			const expectedGame = {
				id: "game-id",
				userId,
				externalServiceId: dto.externalServiceId,
				name: dto.name,
				coverUrl: null,
				status: dto.status,
				addedAt: new Date(),
			};

			mockUserGamesService.add.mockReturnValue(expectedGame);

			const result = controller.addGame(userId, dto);

			expect(result).toEqual(expectedGame);
			expect(mockUserGamesService.add).toHaveBeenCalledWith(userId, dto);
		});
	});

	describe("update", () => {
		it("should update game status and return updated game", () => {
			const userId = "user-1";
			const gameId = "game-1";
			const dto = { status: "played" as const };
			const expectedGame = {
				id: gameId,
				userId,
				externalServiceId: "ext-1",
				name: "Game",
				coverUrl: null,
				status: "played",
				addedAt: new Date(),
				finishedAt: new Date(),
				note: null,
			};

			mockUserGamesService.update.mockReturnValue(expectedGame);

			const result = controller.update(userId, gameId, dto);

			expect(result).toEqual(expectedGame);
			expect(mockUserGamesService.update).toHaveBeenCalledWith(
				userId,
				gameId,
				dto,
			);
			expect(mockUserGamesService.update).toHaveBeenCalledTimes(1);
		});

		it("should accept a note-only update", () => {
			mockUserGamesService.update.mockReturnValue({});

			controller.update("user-1", "game-1", { note: "Halfway through" });

			expect(mockUserGamesService.update).toHaveBeenCalledWith(
				"user-1",
				"game-1",
				{ note: "Halfway through" },
			);
		});

		it("should accept a pin-only update", () => {
			mockUserGamesService.update.mockReturnValue({});

			controller.update("user-1", "game-1", { pinned: true });

			expect(mockUserGamesService.update).toHaveBeenCalledWith(
				"user-1",
				"game-1",
				{ pinned: true },
			);
		});

		it("should reject an empty body", () => {
			expect(() => controller.update("user-1", "game-1", {})).toThrow(
				"Nothing to update",
			);

			expect(mockUserGamesService.update).not.toHaveBeenCalled();
		});

		it("should propagate NotFoundException from service", () => {
			const userId = "user-1";
			const gameId = "non-existent";
			const dto = { status: "playing" as const };

			mockUserGamesService.update.mockImplementation(() => {
				throw new NotFoundException("Game not found for this user");
			});

			expect(() => controller.update(userId, gameId, dto)).toThrow(
				NotFoundException,
			);
			expect(() => controller.update(userId, gameId, dto)).toThrow(
				"Game not found for this user",
			);
		});
	});

	describe("remove", () => {
		it("should remove a game", () => {
			const userId = "user-1";
			const gameId = "game-1";

			mockUserGamesService.remove.mockReturnValue(undefined);

			const result = controller.remove(userId, gameId);

			expect(result).toBeUndefined();
			expect(mockUserGamesService.remove).toHaveBeenCalledWith(userId, gameId);
			expect(mockUserGamesService.remove).toHaveBeenCalledTimes(1);
		});

		it("should propagate NotFoundException from service", () => {
			const userId = "user-1";
			const gameId = "non-existent";

			mockUserGamesService.remove.mockImplementation(() => {
				throw new NotFoundException("Game not found for this user");
			});

			expect(() => controller.remove(userId, gameId)).toThrow(
				NotFoundException,
			);
			expect(() => controller.remove(userId, gameId)).toThrow(
				"Game not found for this user",
			);
		});
	});
});
