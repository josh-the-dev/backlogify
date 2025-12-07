import type { UserGame } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { config } from "../../config";

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

				const response = await fetch(
					`${config.backendUrl}/user-games/${gameId}/status`,
					{
						method: "PATCH",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
						body: JSON.stringify(body),
					},
				);

				if (!response.ok) {
					const error = await response.json().catch(() => ({}));
					return json(
						{ error: error.message || `Upstream error: ${response.status}` },
						{ status: response.status },
					);
				}

				const data = (await response.json()) as UserGame;
				return json(data);
			},
			DELETE: async ({ params }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();
				const { gameId } = params;

				const response = await fetch(
					`${config.backendUrl}/user-games/${gameId}`,
					{
						method: "DELETE",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				if (!response.ok) {
					const error = await response.json().catch(() => ({}));
					return json(
						{ error: error.message || `Upstream error: ${response.status}` },
						{ status: response.status },
					);
				}

				return json({ success: true });
			},
		},
	},
});
