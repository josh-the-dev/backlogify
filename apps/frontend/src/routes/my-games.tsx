import type { GameStatus } from "@backlogify/types";
import { auth } from "@clerk/tanstack-react-start/server";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Plus, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { ShareBacklogDialog } from "../components/UserGames/ShareBacklogDialog";
import { LibraryStats } from "../components/UserGames/LibraryStats";
import { StatusFilter } from "../components/UserGames/StatusFilter";
import { UpNextCard } from "../components/UserGames/UpNextCard";
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
	const [shareOpen, setShareOpen] = useState(false);
	const userGamesQuery = useQuery(userGamesQueryOptions());

	const games = userGamesQuery.data ?? [];
	const upNext = games.find((g) => g.pinnedAt);
	const counts: Record<FilterOption, number> = {
		all: games.length,
		backlog: games.filter((g) => g.status === "backlog").length,
		playing: games.filter((g) => g.status === "playing").length,
		played: games.filter((g) => g.status === "played").length,
		abandoned: games.filter((g) => g.status === "abandoned").length,
	};

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-10">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-display text-3xl font-bold tracking-tight">
						My Games
					</h1>
					<p className="text-muted-foreground mt-1 text-sm">
						{games.length === 1 ? "1 game" : `${games.length} games`} in your
						library
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setShareOpen(true)}
					>
						<Share2 className="size-4" />
						Share
					</Button>
					<Button variant="outline" size="sm" asChild>
						<Link to="/games">
							<Plus className="size-4" />
							Add games
						</Link>
					</Button>
				</div>
			</div>
			{upNext && <UpNextCard game={upNext} />}
			<LibraryStats games={games} />
			<div className="mt-6">
				<StatusFilter
					value={statusFilter}
					onChange={setStatusFilter}
					counts={counts}
				/>
			</div>
			<UserGameList query={userGamesQuery} statusFilter={statusFilter} />
			<ShareBacklogDialog open={shareOpen} onOpenChange={setShareOpen} />
		</div>
	);
}
