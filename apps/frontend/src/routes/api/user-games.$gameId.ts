import type { UserGame } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { HTTPError } from "ky";
import { backendApi } from "../../backend-api";

export const Route = createFileRoute("/api/user-games/$gameId")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();
				const { gameId } = params;
				const body = await request.json();

				try {
					const data = await backendApi
						.patch(`user-games/${gameId}`, {
							headers: { Authorization: `Bearer ${token}` },
							json: body,
						})
						.json<UserGame>();
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
			DELETE: async ({ params }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();
				const { gameId } = params;

				try {
					await backendApi.delete(`user-games/${gameId}`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					return json({ success: true });
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
