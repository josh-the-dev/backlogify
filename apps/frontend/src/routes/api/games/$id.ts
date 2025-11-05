import type { GameDetails } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/games/$id")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const { id } = params;

				if (!id) {
					return json({ error: "Missing game ID" }, { status: 400 });
				}

				const response = await fetch(`http://localhost:3001/games/${id}`);

				if (!response.ok) {
					return json(
						{ error: `Upstream error: ${response.status}` },
						{ status: 500 },
					);
				}

				const rawData = (await response.json()) as GameDetails;

				const data = {
					id: rawData.id,
					name: rawData.name,
					description: rawData.description ?? "",
					releaseDate: rawData.releaseDate ?? "Unknown",
					coverUrl: rawData.coverUrl ?? null,
					genres: rawData.genres ?? [],
					platforms: rawData.platforms ?? [],
				};

				return json(data);
			},
		},
	},
});
