import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { DRIZZLE } from "../database";
import { ProfilesService } from "./profiles.service";

describe("ProfilesService", () => {
	let service: ProfilesService;
	let mockDb: {
		select: jest.Mock;
		insert: jest.Mock;
	};

	beforeEach(async () => {
		mockDb = {
			select: jest.fn(),
			insert: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [ProfilesService, { provide: DRIZZLE, useValue: mockDb }],
		}).compile();

		service = module.get<ProfilesService>(ProfilesService);
	});

	// .select().from().where().limit() resolves to `rows`.
	function mockSelectOnce(rows: unknown[]) {
		mockDb.select.mockReturnValueOnce({
			from: jest.fn().mockReturnValue({
				where: jest.fn().mockReturnValue({
					limit: jest.fn().mockResolvedValue(rows),
				}),
			}),
		});
	}

	// .select().from().where().limit().offset() resolves to `rows`.
	function mockSelectPaginatedOnce(rows: unknown[]) {
		mockDb.select.mockReturnValueOnce({
			from: jest.fn().mockReturnValue({
				where: jest.fn().mockReturnValue({
					limit: jest.fn().mockReturnValue({
						offset: jest.fn().mockResolvedValue(rows),
					}),
				}),
			}),
		});
	}

	describe("getMine", () => {
		it("returns null when the user has no profile", async () => {
			mockSelectOnce([]);
			await expect(service.getMine("user-1")).resolves.toBeNull();
		});

		it("returns the profile without the userId field", async () => {
			mockSelectOnce([{ userId: "user-1", username: "ada", isPublic: true }]);

			const result = await service.getMine("user-1");

			expect(result).toEqual({ username: "ada", isPublic: true });
			expect(result).not.toHaveProperty("userId");
		});
	});

	describe("upsert", () => {
		function mockInsert(returned: unknown[]) {
			const returning = jest.fn().mockResolvedValue(returned);
			mockDb.insert.mockReturnValue({
				values: jest.fn().mockReturnValue({
					onConflictDoUpdate: jest.fn().mockReturnValue({ returning }),
				}),
			});
			return returning;
		}

		it("lowercases the username before storing", async () => {
			const valuesMock = jest.fn().mockReturnValue({
				onConflictDoUpdate: jest.fn().mockReturnValue({
					returning: jest
						.fn()
						.mockResolvedValue([{ username: "ada", isPublic: false }]),
				}),
			});
			mockDb.insert.mockReturnValue({ values: valuesMock });

			await service.upsert("user-1", { username: "AdA", isPublic: false });

			expect(valuesMock).toHaveBeenCalledWith({
				userId: "user-1",
				username: "ada",
				isPublic: false,
			});
		});

		it("returns the saved profile", async () => {
			mockInsert([{ username: "ada", isPublic: true }]);

			const result = await service.upsert("user-1", {
				username: "ada",
				isPublic: true,
			});

			expect(result).toEqual({ username: "ada", isPublic: true });
		});

		it("throws BadRequestException for a reserved username", async () => {
			await expect(
				service.upsert("user-1", { username: "Admin", isPublic: true }),
			).rejects.toThrow(BadRequestException);
			// Should reject before touching the database.
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it("throws ConflictException when the username is taken", async () => {
			mockDb.insert.mockReturnValue({
				values: jest.fn().mockReturnValue({
					onConflictDoUpdate: jest.fn().mockReturnValue({
						returning: jest.fn().mockRejectedValue({ code: "23505" }),
					}),
				}),
			});

			await expect(
				service.upsert("user-1", { username: "taken", isPublic: true }),
			).rejects.toThrow(ConflictException);
		});
	});

	describe("getPublicBacklog", () => {
		it("throws NotFoundException when no profile exists", async () => {
			mockSelectOnce([]);
			await expect(service.getPublicBacklog("nobody")).rejects.toThrow(
				NotFoundException,
			);
		});

		it("throws NotFoundException when the profile is private", async () => {
			mockSelectOnce([{ userId: "user-1", username: "ada", isPublic: false }]);
			await expect(service.getPublicBacklog("ada")).rejects.toThrow(
				NotFoundException,
			);
		});

		it("returns the username and games for a public profile", async () => {
			mockSelectOnce([{ userId: "user-1", username: "ada", isPublic: true }]);
			mockSelectPaginatedOnce([
				{
					id: "game-1",
					userId: "user-1",
					externalServiceId: "ext-1",
					name: "Game 1",
					coverUrl: null,
					status: "backlog",
					addedAt: new Date(),
					finishedAt: null,
					note: null,
					pinnedAt: null,
				},
			]);

			const result = await service.getPublicBacklog("Ada");

			expect(result.username).toBe("ada");
			expect(result.games).toHaveLength(1);
			expect(result.games[0].name).toBe("Game 1");
			// The Clerk subject id must never leak on the public surface.
			expect(result.games[0]).not.toHaveProperty("userId");
		});
	});
});
