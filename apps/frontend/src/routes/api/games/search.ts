import type { GameSearchResult } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

export const Route = createFileRoute("/api/games/search")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				console.log("in api route");
				const url = new URL(request.url);
				const query = url.searchParams.get("query");

				if (!query || !query.trim()) {
					return json({ error: "Missing query parameter" }, { status: 400 });
				}

				const response = await fetch(
					`http://localhost:3001/games/search?query=${encodeURIComponent(query)}`,
				);

				if (!response.ok) {
					return json(
						{ error: `Upstream error: ${response.status}` },
						{ status: 500 },
					);
				}

				const data = (await response.json()) as GameSearchResult[];
				return json(data);
			},
		},
	},
});
