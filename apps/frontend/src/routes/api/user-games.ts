import type { UserGame } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { config } from "../../config";

export const Route = createFileRoute("/api/user-games")({
	server: {
		handlers: {
			GET: async () => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();

				const response = await fetch(`${config.backendUrl}/user-games`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					return json(
						{ error: `Upstream error: ${response.status}` },
						{ status: response.status },
					);
				}

				const data = (await response.json()) as UserGame[];
				return json(data);
			},
			POST: async ({ request }) => {
				const { userId, getToken } = await auth();

				if (!userId) {
					return json({ error: "Unauthorized" }, { status: 401 });
				}

				const token = await getToken();
				const body = await request.json();

				const response = await fetch(`${config.backendUrl}/user-games`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(body),
				});

				if (!response.ok) {
					const error = await response.json().catch(() => ({}));
					return json(
						{ error: error.message || `Upstream error: ${response.status}` },
						{ status: response.status },
					);
				}

				const data = (await response.json()) as UserGame;
				return json(data, { status: 201 });
			},
		},
	},
});
