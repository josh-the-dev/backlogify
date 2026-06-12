import type { UserGame } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../backend-api";

export const Route = createFileRoute("/api/user-games")({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();

				const url = new URL(request.url);
				const searchParams: Record<string, string> = {};
				const limit = url.searchParams.get("limit");
				const offset = url.searchParams.get("offset");
				if (limit) searchParams.limit = limit;
				if (offset) searchParams.offset = offset;

				try {
					const data = await backendApi
						.get("user-games", {
							headers: { Authorization: `Bearer ${token}` },
							searchParams,
						})
						.json<UserGame[]>();
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
			POST: async ({ request }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();
				const body = await request.json();

				try {
					const data = await backendApi
						.post("user-games", {
							headers: { Authorization: `Bearer ${token}` },
							json: body,
						})
						.json<UserGame>();
					return json(data, { status: 201 });
				} catch (e) {
					if (e instanceof HTTPError) {
						const error = await e.response.json().catch(() => ({}));
						return json(
							{ error: error.message || `Upstream error: ${e.response.status}` },
							{ status: e.response.status },
						);
					}
					throw e;
				}
			},
		},
	},
});
