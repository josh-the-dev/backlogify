import {
	addUserGameSchema,
	paginationSchema,
	updateUserGameSchema,
	type UserGame,
} from "@backlogify/types";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { authMiddleware, sessionMiddleware } from "./auth";
import { backendApi } from "./backend-api";

const gameIdSchema = z.uuid();

// Game pages ask for the library to show "in your backlog" state even for
// signed-out visitors, who simply have an empty one
export const listUserGames = createServerFn({ method: "GET" })
	.middleware([sessionMiddleware])
	.validator(paginationSchema)
	.handler(async ({ data, context }): Promise<UserGame[]> => {
		if (!context.authHeaders) return [];
		return backendApi
			.get("user-games", { headers: context.authHeaders, searchParams: data })
			.json<UserGame[]>();
	});

export const addUserGame = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(addUserGameSchema)
	.handler(({ data, context }) =>
		backendApi
			.post("user-games", { headers: context.authHeaders, json: data })
			.json<UserGame>(),
	);

export const updateUserGame = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(updateUserGameSchema.extend({ gameId: gameIdSchema }))
	.handler(({ data: { gameId, ...changes }, context }) =>
		backendApi
			.patch(`user-games/${gameId}`, {
				headers: context.authHeaders,
				json: changes,
			})
			.json<UserGame>(),
	);

export const removeUserGame = createServerFn({ method: "POST" })
	.middleware([authMiddleware])
	.validator(z.object({ gameId: gameIdSchema }))
	.handler(async ({ data, context }) => {
		await backendApi.delete(`user-games/${data.gameId}`, {
			headers: context.authHeaders,
		});
	});
