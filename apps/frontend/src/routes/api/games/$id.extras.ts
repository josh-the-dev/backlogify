import type { GameExtras } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../../backend-api";

export const Route = createFileRoute("/api/games/$id/extras")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { id } = params;

				if (!id) {
					return json({ error: "Missing game ID" }, { status: 400 });
				}

				try {
					const data = await backendApi
						.get(`games/${id}/extras`)
						.json<GameExtras>();

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
