import type { GameStatus } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatusFilter } from "../components/UserGames/StatusFilter";
import { UserGameList } from "../components/UserGames/UserGameList";
import { userGamesQueryOptions } from "../queries/user-games";

type FilterOption = GameStatus | "all";

export const Route = createFileRoute("/my-games")({
	component: MyGamesPage,
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
