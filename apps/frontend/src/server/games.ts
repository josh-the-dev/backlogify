import type {
	GameDetails,
	GameExtras,
	GameSearchResult,
} from "@backlogify/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { backendApi } from "./backend-api";

const pageSchema = z.number().int().min(1);
const rawgIdSchema = z.object({ id: z.string().regex(/^\d+$/) });

export const searchGames = createServerFn({ method: "GET" })
	.validator(z.object({ query: z.string().trim().min(1), page: pageSchema }))
	.handler(({ data }) =>
		backendApi
			.get("games/search", { searchParams: data })
			.json<GameSearchResult[]>(),
	);

export const getPopularGames = createServerFn({ method: "GET" })
	.validator(z.object({ page: pageSchema }))
	.handler(({ data }) =>
		backendApi
			.get("games/popular", { searchParams: data })
			.json<GameSearchResult[]>(),
	);

export const getGameDetails = createServerFn({ method: "GET" })
	.validator(rawgIdSchema)
	.handler(({ data }) =>
		backendApi.get(`games/${data.id}`).json<GameDetails>(),
	);

export const getGameExtras = createServerFn({ method: "GET" })
	.validator(rawgIdSchema)
	.handler(({ data }) =>
		backendApi.get(`games/${data.id}/extras`).json<GameExtras>(),
	);
