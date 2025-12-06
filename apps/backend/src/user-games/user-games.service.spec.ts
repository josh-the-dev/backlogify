import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { UserGamesService } from "./user-games.service";

describe("UserGamesService", () => {
	let service: UserGamesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [UserGamesService],
		}).compile();

		service = module.get<UserGamesService>(UserGamesService);
	});

	describe("getAll", () => {
		it("should return empty array when user has no games", () => {
			const result = service.getAll("user-1");

			expect(result).toEqual([]);
		});

		it("should return only games belonging to the specified user", () => {
			service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game 1",
				status: "backlog",
			});
			service.add("user-2", {
				externalServiceId: "ext-2",
				name: "Game 2",
				status: "playing",
			});
			service.add("user-1", {
				externalServiceId: "ext-3",
				name: "Game 3",
				status: "played",
			});

			const result = service.getAll("user-1");

			expect(result).toHaveLength(2);
			expect(result.every((g) => g.userId === "user-1")).toBe(true);
			expect(result.map((g) => g.name)).toEqual(["Game 1", "Game 3"]);
		});
	});

	describe("add", () => {
		it("should add a game with all required fields", () => {
			const dto = {
				externalServiceId: "ext-123",
				name: "The Witcher 3",
				status: "backlog" as const,
			};

			const result = service.add("user-1", dto);

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

		it("should add a game with optional coverUrl", () => {
			const dto = {
				externalServiceId: "ext-456",
				name: "Elden Ring",
				coverUrl: "https://example.com/elden-ring.jpg",
				status: "playing" as const,
			};

			const result = service.add("user-1", dto);

			expect(result.coverUrl).toBe("https://example.com/elden-ring.jpg");
		});

		it("should generate unique ids for each game", () => {
			const dto = {
				externalServiceId: "ext-1",
				name: "Game",
				status: "backlog" as const,
			};

			const game1 = service.add("user-1", dto);
			const game2 = service.add("user-1", dto);

			expect(game1.id).not.toBe(game2.id);
		});

		it("should persist the game to the list", () => {
			const dto = {
				externalServiceId: "ext-1",
				name: "Test Game",
				status: "backlog" as const,
			};

			service.add("user-1", dto);
			const games = service.getAll("user-1");

			expect(games).toHaveLength(1);
			expect(games[0].name).toBe("Test Game");
		});
	});

	describe("updateStatus", () => {
		it("should update the status of an existing game", () => {
			const game = service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game",
				status: "backlog",
			});

			const result = service.updateStatus("user-1", game.id, "playing");

			expect(result.status).toBe("playing");
		});

		it("should throw NotFoundException when game does not exist", () => {
			expect(() => {
				service.updateStatus("user-1", "non-existent-id", "playing");
			}).toThrow(NotFoundException);
			expect(() => {
				service.updateStatus("user-1", "non-existent-id", "playing");
			}).toThrow("Game not found for this user");
		});

		it("should throw NotFoundException when game belongs to different user", () => {
			const game = service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game",
				status: "backlog",
			});

			expect(() => {
				service.updateStatus("user-2", game.id, "playing");
			}).toThrow(NotFoundException);
		});

		it("should persist the status change", () => {
			const game = service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game",
				status: "backlog",
			});

			service.updateStatus("user-1", game.id, "played");
			const games = service.getAll("user-1");

			expect(games[0].status).toBe("played");
		});
	});

	describe("remove", () => {
		it("should remove an existing game", () => {
			const game = service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game to Remove",
				status: "backlog",
			});

			service.remove("user-1", game.id);
			const games = service.getAll("user-1");

			expect(games).toHaveLength(0);
		});

		it("should throw NotFoundException when game does not exist", () => {
			expect(() => {
				service.remove("user-1", "non-existent-id");
			}).toThrow(NotFoundException);
			expect(() => {
				service.remove("user-1", "non-existent-id");
			}).toThrow("Game not found for this user");
		});

		it("should throw NotFoundException when game belongs to different user", () => {
			const game = service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game",
				status: "backlog",
			});

			expect(() => {
				service.remove("user-2", game.id);
			}).toThrow(NotFoundException);
		});

		it("should only remove the specified game", () => {
			const game1 = service.add("user-1", {
				externalServiceId: "ext-1",
				name: "Game 1",
				status: "backlog",
			});
			service.add("user-1", {
				externalServiceId: "ext-2",
				name: "Game 2",
				status: "playing",
			});

			service.remove("user-1", game1.id);
			const games = service.getAll("user-1");

			expect(games).toHaveLength(1);
			expect(games[0].name).toBe("Game 2");
		});
	});
});
