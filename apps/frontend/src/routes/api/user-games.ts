import type { UserGame } from "@backlogify/types";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

const DEMO_USER_ID = "demo-user";

export const Route = createFileRoute("/api/user-games")({
	server: {
		handlers: {
			GET: async () => {
				const response = await fetch(
					`http://localhost:3001/users/${DEMO_USER_ID}/games`,
				);

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
				const body = await request.json();

				const response = await fetch(
					`http://localhost:3001/users/${DEMO_USER_ID}/games`,
					{
						method: "POST",
						headers: { "Content-Type": "application/json" },
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
				return json(data, { status: 201 });
			},
		},
	},
});
