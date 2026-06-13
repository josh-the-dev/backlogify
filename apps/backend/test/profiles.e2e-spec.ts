import {
	ExecutionContext,
	INestApplication,
	ValidationPipe,
} from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as request from "supertest";
import { AppModule } from "../src/app.module";
import { ClerkAuthGuard } from "../src/auth";
import { AllExceptionsFilter } from "../src/common/http-exception.filter";
import { LoggingInterceptor } from "../src/common/logging.interceptor";

const TEST_API_KEY = "e2e-test-key";
const TEST_USER_ID = "e2e-profiles-user-999";
// Unique-ish slug so the row (keyed on the fixed test userId) is just updated
// across runs and never collides with a real user.
const TEST_USERNAME = "e2e-sharer";

const mockClerkGuard = {
	canActivate: (ctx: ExecutionContext) => {
		ctx.switchToHttp().getRequest().userId = TEST_USER_ID;
		return true;
	},
};

describe("ProfilesController (e2e)", () => {
	let app: INestApplication;
	let createdGameId: string;

	beforeAll(async () => {
		process.env.API_KEY = TEST_API_KEY;
		process.env.RAWG_API_KEY ??= "e2e-dummy-rawg-key";
		process.env.CLERK_SECRET_KEY ??= "e2e-dummy-clerk-key";
		process.env.CLERK_PUBLISHABLE_KEY ??= "e2e-dummy-clerk-publishable-key";
		process.env.DATABASE_URL ??=
			"postgresql://postgres:postgres@localhost:5432/backlogify_test";

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideGuard(ClerkAuthGuard)
			.useValue(mockClerkGuard)
			.compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalFilters(new AllExceptionsFilter());
		app.useGlobalInterceptors(new LoggingInterceptor());
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
				forbidNonWhitelisted: true,
				transform: true,
				transformOptions: { enableImplicitConversion: true },
			}),
		);
		await app.init();

		// Seed one game for the test user so the public backlog has content.
		const res = await request(app.getHttpServer())
			.post("/user-games")
			.set("x-api-key", TEST_API_KEY)
			.send({
				externalServiceId: "rawg-profile-1",
				name: "Public Backlog Game",
				status: "backlog",
			});
		createdGameId = res.body.id;
	});

	afterAll(async () => {
		if (createdGameId) {
			await request(app.getHttpServer())
				.delete(`/user-games/${createdGameId}`)
				.set("x-api-key", TEST_API_KEY);
		}
		// Leave the profile private so we don't leave a public test artifact.
		await request(app.getHttpServer())
			.put("/profiles/me")
			.set("x-api-key", TEST_API_KEY)
			.send({ username: TEST_USERNAME, isPublic: false });
		await app.close();
	});

	describe("PUT /profiles/me", () => {
		it("claims a username (private by default choice)", async () => {
			const res = await request(app.getHttpServer())
				.put("/profiles/me")
				.set("x-api-key", TEST_API_KEY)
				.send({ username: TEST_USERNAME, isPublic: false });

			expect(res.status).toBe(200);
			expect(res.body).toEqual({
				username: TEST_USERNAME,
				isPublic: false,
			});
			// Clerk subject id must not be exposed.
			expect(res.body).not.toHaveProperty("userId");
		});

		it("lowercases the stored username", async () => {
			const res = await request(app.getHttpServer())
				.put("/profiles/me")
				.set("x-api-key", TEST_API_KEY)
				.send({ username: TEST_USERNAME.toUpperCase(), isPublic: false });

			expect(res.status).toBe(200);
			expect(res.body.username).toBe(TEST_USERNAME);
		});

		it("returns 400 for an invalid username", async () => {
			const res = await request(app.getHttpServer())
				.put("/profiles/me")
				.set("x-api-key", TEST_API_KEY)
				.send({ username: "no spaces!", isPublic: true });

			expect(res.status).toBe(400);
		});

		it("returns 401 when API key is missing", async () => {
			const res = await request(app.getHttpServer())
				.put("/profiles/me")
				.send({ username: TEST_USERNAME, isPublic: true });

			expect(res.status).toBe(401);
		});
	});

	describe("GET /profiles/me", () => {
		it("returns the caller's profile", async () => {
			const res = await request(app.getHttpServer())
				.get("/profiles/me")
				.set("x-api-key", TEST_API_KEY);

			expect(res.status).toBe(200);
			expect(res.body.username).toBe(TEST_USERNAME);
		});
	});

	describe("GET /profiles/:username/backlog", () => {
		it("returns 404 while the profile is private", async () => {
			await request(app.getHttpServer())
				.put("/profiles/me")
				.set("x-api-key", TEST_API_KEY)
				.send({ username: TEST_USERNAME, isPublic: false });

			const res = await request(app.getHttpServer())
				.get(`/profiles/${TEST_USERNAME}/backlog`)
				.set("x-api-key", TEST_API_KEY);

			expect(res.status).toBe(404);
		});

		it("returns 200 with games once public, without leaking userId", async () => {
			await request(app.getHttpServer())
				.put("/profiles/me")
				.set("x-api-key", TEST_API_KEY)
				.send({ username: TEST_USERNAME, isPublic: true });

			const res = await request(app.getHttpServer())
				.get(`/profiles/${TEST_USERNAME}/backlog`)
				.set("x-api-key", TEST_API_KEY);

			expect(res.status).toBe(200);
			expect(res.body.username).toBe(TEST_USERNAME);
			expect(Array.isArray(res.body.games)).toBe(true);
			const seeded = res.body.games.find(
				(g: { id: string }) => g.id === createdGameId,
			);
			expect(seeded).toBeDefined();
			expect(seeded).not.toHaveProperty("userId");
		});

		it("is reachable case-insensitively", async () => {
			const res = await request(app.getHttpServer())
				.get(`/profiles/${TEST_USERNAME.toUpperCase()}/backlog`)
				.set("x-api-key", TEST_API_KEY);

			expect(res.status).toBe(200);
		});

		it("returns 404 for an unknown username", async () => {
			const res = await request(app.getHttpServer())
				.get("/profiles/definitely-not-a-real-user-xyz/backlog")
				.set("x-api-key", TEST_API_KEY);

			expect(res.status).toBe(404);
		});
	});
});
