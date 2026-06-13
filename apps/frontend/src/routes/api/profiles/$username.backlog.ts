import type { PublicBacklog } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../../backend-api";

export const Route = createFileRoute("/api/profiles/$username/backlog")({
	server: {
		handlers: {
			// Public: no Clerk JWT. backendApi still carries the server-to-server
			// x-api-key. The backend returns 404 for private or missing profiles.
			GET: async ({ params, request }) => {
				const { username } = params;

				const url = new URL(request.url);
				const searchParams: Record<string, string> = {};
				const limit = url.searchParams.get("limit");
				const offset = url.searchParams.get("offset");
				if (limit) searchParams.limit = limit;
				if (offset) searchParams.offset = offset;

				try {
					const data = await backendApi
						.get(`profiles/${encodeURIComponent(username)}/backlog`, {
							searchParams,
						})
						.json<PublicBacklog>();
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
