import type { GameStatus } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { StatusFilter } from "../components/UserGames/StatusFilter";
import { UserGameList } from "../components/UserGames/UserGameList";
import { userGamesQueryOptions } from "../queries/user-games";

type FilterOption = GameStatus | "all";

const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
	const { isAuthenticated, userId } = await auth();

	if (!isAuthenticated) {
		// This will error because you're redirecting to a path that doesn't exist yet
		// You can create a sign-in route to handle this
		// See https://clerk.com/docs/tanstack-react-start/guides/development/custom-sign-in-or-up-page
		throw redirect({
			to: "/sign-in",
			search: { redirect: "/my-games" },
		});
	}

	return { userId };
});

export const Route = createFileRoute("/my-games")({
	component: MyGamesPage,
	beforeLoad: async () => await authStateFn(),
	loader: async ({ context }) => {
		return { userId: context.userId };
	},
});

function MyGamesPage() {
	const [statusFilter, setStatusFilter] = useState<FilterOption>("all");
	const userGamesQuery = useQuery(userGamesQueryOptions());

	const games = userGamesQuery.data ?? [];
	const counts: Record<FilterOption, number> = {
		all: games.length,
		backlog: games.filter((g) => g.status === "backlog").length,
		playing: games.filter((g) => g.status === "playing").length,
		played: games.filter((g) => g.status === "played").length,
	};

	return (
		<div className="mx-auto max-w-6xl p-6">
			<h1 className="mb-6 text-center font-bold text-3xl tracking-tight">
				My Games
			</h1>
			<StatusFilter
				value={statusFilter}
				onChange={setStatusFilter}
				counts={counts}
			/>
			<UserGameList query={userGamesQuery} statusFilter={statusFilter} />
		</div>
	);
}
