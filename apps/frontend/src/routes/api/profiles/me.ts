import type { UserProfile } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../../backend-api";

export const Route = createFileRoute("/api/profiles/me")({
	server: {
		handlers: {
			GET: async () => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();

				try {
					const data = await backendApi
						.get("profiles/me", {
							headers: { Authorization: `Bearer ${token}` },
						})
						.json<UserProfile | null>();
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
			PUT: async ({ request }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();
				const body = await request.json();

				try {
					const data = await backendApi
						.put("profiles/me", {
							headers: { Authorization: `Bearer ${token}` },
							json: body,
						})
						.json<UserProfile>();
					return json(data);
				} catch (e) {
					if (e instanceof HTTPError) {
						const error = await e.response.json().catch(() => ({}));
						return json(
							{
								error: error.message || `Upstream error: ${e.response.status}`,
							},
							{ status: e.response.status },
						);
					}
					throw e;
				}
			},
		},
	},
});
