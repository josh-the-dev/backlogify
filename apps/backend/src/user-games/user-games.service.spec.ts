import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DRIZZLE } from "../database";
import { UserGamesService } from "./user-games.service";

describe("UserGamesService", () => {
	let service: UserGamesService;
	let mockDb: {
		select: jest.Mock;
		insert: jest.Mock;
		update: jest.Mock;
		delete: jest.Mock;
	};

	beforeEach(async () => {
		mockDb = {
			select: jest.fn(),
			insert: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				UserGamesService,
				{
					provide: DRIZZLE,
					useValue: mockDb,
				},
			],
		}).compile();

		service = module.get<UserGamesService>(UserGamesService);
	});

	describe("getAll", () => {
		it("should return empty array when user has no games", async () => {
			mockDb.select.mockReturnValue({
				from: jest.fn().mockReturnValue({
					where: jest.fn().mockReturnValue({
						limit: jest.fn().mockReturnValue({
							offset: jest.fn().mockResolvedValue([]),
						}),
					}),
				}),
			});

			const result = await service.getAll("user-1", { limit: 50, offset: 0 });

			expect(result).toEqual([]);
		});

		it("should return only games belonging to the specified user", async () => {
			const mockGames = [
				{
					id: "game-1",
					userId: "user-1",
					externalServiceId: "ext-1",
					name: "Game 1",
					coverUrl: null,
					status: "backlog",
					addedAt: new Date(),
				},
				{
					id: "game-2",
					userId: "user-1",
					externalServiceId: "ext-3",
					name: "Game 3",
					coverUrl: null,
					status: "played",
					addedAt: new Date(),
				},
			];

			mockDb.select.mockReturnValue({
				from: jest.fn().mockReturnValue({
					where: jest.fn().mockReturnValue({
						limit: jest.fn().mockReturnValue({
							offset: jest.fn().mockResolvedValue(mockGames),
						}),
					}),
				}),
			});

			const result = await service.getAll("user-1", { limit: 50, offset: 0 });

			expect(result).toHaveLength(2);
			expect(result.every((g) => g.userId === "user-1")).toBe(true);
			expect(result.map((g) => g.name)).toEqual(["Game 1", "Game 3"]);
		});
	});

	describe("add", () => {
		it("should add a game with all required fields", async () => {
			const insertedGame = {
				id: "generated-id",
				userId: "user-1",
				externalServiceId: "ext-123",
				name: "The Witcher 3",
				coverUrl: null,
				status: "backlog",
				addedAt: new Date(),
			};

			mockDb.insert.mockReturnValue({
				values: jest.fn().mockReturnValue({
					returning: jest.fn().mockResolvedValue([insertedGame]),
				}),
			});

			const result = await service.add("user-1", {
				externalServiceId: "ext-123",
				name: "The Witcher 3",
				status: "backlog",
			});

			expect(result).toMatchObject({
				userId: "user-1",
				externalServiceId: "ext-123",
				name: "The Witcher 3",
				status: "backlog",
				coverUrl: null,
			});
			expect(result.id).toBeDefined();
			expect(result.addedAt).toBeInstanceOf(Date);
		});

		it("should add a game with optional coverUrl", async () => {
			const insertedGame = {
				id: "generated-id",
				userId: "user-1",
				externalServiceId: "ext-456",
				name: "Elden Ring",
				coverUrl: "https://example.com/elden-ring.jpg",
				status: "playing",
				addedAt: new Date(),
			};

			mockDb.insert.mockReturnValue({
				values: jest.fn().mockReturnValue({
					returning: jest.fn().mockResolvedValue([insertedGame]),
				}),
			});

			const result = await service.add("user-1", {
				externalServiceId: "ext-456",
				name: "Elden Ring",
				coverUrl: "https://example.com/elden-ring.jpg",
				status: "playing",
			});

			expect(result.coverUrl).toBe("https://example.com/elden-ring.jpg");
		});
	});

	describe("updateStatus", () => {
		it("should update the status of an existing game", async () => {
			const updatedGame = {
				id: "game-1",
				userId: "user-1",
				externalServiceId: "ext-1",
				name: "Game",
				coverUrl: null,
				status: "playing",
				addedAt: new Date(),
			};

			mockDb.update.mockReturnValue({
				set: jest.fn().mockReturnValue({
					where: jest.fn().mockReturnValue({
						returning: jest.fn().mockResolvedValue([updatedGame]),
					}),
				}),
			});

			const result = await service.updateStatus("user-1", "game-1", "playing");

			expect(result.status).toBe("playing");
		});

		it("should throw NotFoundException when game does not exist", async () => {
			mockDb.update.mockReturnValue({
				set: jest.fn().mockReturnValue({
					where: jest.fn().mockReturnValue({
						returning: jest.fn().mockResolvedValue([]),
					}),
				}),
			});

			await expect(
				service.updateStatus("user-1", "non-existent-id", "playing"),
			).rejects.toThrow(NotFoundException);
			await expect(
				service.updateStatus("user-1", "non-existent-id", "playing"),
			).rejects.toThrow("Game not found for this user");
		});
	});

	describe("remove", () => {
		it("should remove an existing game", async () => {
			mockDb.delete.mockReturnValue({
				where: jest.fn().mockReturnValue({
					returning: jest.fn().mockResolvedValue([{ id: "game-1" }]),
				}),
			});

			await expect(service.remove("user-1", "game-1")).resolves.not.toThrow();
		});

		it("should throw NotFoundException when game does not exist", async () => {
			mockDb.delete.mockReturnValue({
				where: jest.fn().mockReturnValue({
					returning: jest.fn().mockResolvedValue([]),
				}),
			});

			await expect(
				service.remove("user-1", "non-existent-id"),
			).rejects.toThrow(NotFoundException);
			await expect(
				service.remove("user-1", "non-existent-id"),
			).rejects.toThrow("Game not found for this user");
		});
	});
});
