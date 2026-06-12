import type { GameStatus } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { StatusFilter } from "../components/UserGames/StatusFilter";
import { UserGameList } from "../components/UserGames/UserGameList";
import { userGamesQueryOptions } from "../queries/user-games";

type FilterOption = GameStatus | "all";

const authStateFn = createServerFn({ method: "GET" }).handler(async () => {
	const { isAuthenticated, userId } = await auth();

	if (!isAuthenticated) {
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
		<div className="mx-auto w-full max-w-6xl px-6 py-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-display font-bold text-3xl tracking-tight">
						My Games
					</h1>
					<p className="mt-1 text-muted-foreground text-sm">
						{games.length === 1 ? "1 game" : `${games.length} games`} in your
						library
					</p>
				</div>
				<Button variant="outline" size="sm" asChild>
					<Link to="/games">
						<Plus className="size-4" />
						Add games
					</Link>
				</Button>
			</div>
			<div className="mt-6">
				<StatusFilter
					value={statusFilter}
					onChange={setStatusFilter}
					counts={counts}
				/>
			</div>
			<UserGameList query={userGamesQuery} statusFilter={statusFilter} />
		</div>
	);
}
