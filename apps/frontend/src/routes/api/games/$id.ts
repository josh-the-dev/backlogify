import type { GameDetails } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../../backend-api";

export const Route = createFileRoute("/api/games/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { id } = params;

				if (!id) {
					return json({ error: "Missing game ID" }, { status: 400 });
				}

				try {
					const rawData = await backendApi
						.get(`games/${id}`)
						.json<GameDetails>();

					const data = {
						id: rawData.id,
						name: rawData.name,
						description: rawData.description ?? "",
						releaseDate: rawData.releaseDate,
						coverUrl: rawData.coverUrl ?? null,
						genres: rawData.genres ?? [],
						platforms: rawData.platforms ?? [],
					};

					return json(data);
				} catch (e) {
					if (e instanceof HTTPError) {
						return json(
							{ error: `Upstream error: ${e.response.status}` },
							{ status: 500 },
						);
					}
					throw e;
				}
			},
		},
	},
});
