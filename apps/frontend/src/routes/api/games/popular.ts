import type { GameSearchResult } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../../backend-api";

export const Route = createFileRoute("/api/games/popular")({
	server: {
		handlers: {
			GET: async () => {
				try {
					const data = await backendApi
						.get("games/popular")
						.json<GameSearchResult[]>();
					return json(data);
				} catch (e) {
					if (e instanceof HTTPError) {
						return json(
							{ error: `Upstream error: ${e.response.status}` },
							{ status: e.response.status },
						);
					}
					throw e;
				}
			},
		},
	},
});
