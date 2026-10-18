import type { Mock } from "vitest";
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
		select: Mock;
		insert: Mock;
	};

	beforeEach(async () => {
		mockDb = {
			select: vi.fn(),
			insert: vi.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [ProfilesService, { provide: DRIZZLE, useValue: mockDb }],
		}).compile();

		service = module.get<ProfilesService>(ProfilesService);
	});

	// .select().from().where().limit() resolves to `rows`.
	function mockSelectOnce(rows: unknown[]) {
		mockDb.select.mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockResolvedValue(rows),
				}),
			}),
		});
	}

	// .select().from().where().limit().offset() resolves to `rows`.
	function mockSelectPaginatedOnce(rows: unknown[]) {
		mockDb.select.mockReturnValueOnce({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					limit: vi.fn().mockReturnValue({
						offset: vi.fn().mockResolvedValue(rows),
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

		// userId is stripped by the response schema on the way out, which
		// the profiles e2e spec covers
		it("returns the stored profile", async () => {
			const row = { userId: "user-1", username: "ada", isPublic: true };
			mockSelectOnce([row]);

			await expect(service.getMine("user-1")).resolves.toEqual(row);
		});
	});

	describe("upsert", () => {
		function mockInsert(returned: unknown[]) {
			const returning = vi.fn().mockResolvedValue(returned);
			mockDb.insert.mockReturnValue({
				values: vi.fn().mockReturnValue({
					onConflictDoUpdate: vi.fn().mockReturnValue({ returning }),
				}),
			});
			return returning;
		}

		it("lowercases the username before storing", async () => {
			const valuesMock = vi.fn().mockReturnValue({
				onConflictDoUpdate: vi.fn().mockReturnValue({
					returning: vi
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
				values: vi.fn().mockReturnValue({
					onConflictDoUpdate: vi.fn().mockReturnValue({
						returning: vi.fn().mockRejectedValue({ code: "23505" }),
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
			// The Clerk subject id must never leak on the public surface, so
			// the games query doesn't select it at all
			const gameColumns = mockDb.select.mock.calls[1][0];
			expect(gameColumns).toHaveProperty("id");
			expect(gameColumns).not.toHaveProperty("userId");
		});
	});
});
