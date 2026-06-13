import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { GameStatus } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { AlertCircle, Gamepad2, RotateCw, Search } from "lucide-react";
import { useState } from "react";
import { PublicGameList } from "../../components/PublicBacklog/PublicGameList";
import { LibraryStats } from "../../components/UserGames/LibraryStats";
import { StatusFilter } from "../../components/UserGames/StatusFilter";
import { UpNextCard } from "../../components/UserGames/UpNextCard";
import {
	BacklogNotFoundError,
	publicBacklogQueryOptions,
} from "../../queries/profiles";

type FilterOption = GameStatus | "all";

export const Route = createFileRoute("/u/$username")({
	// Warm the cache and surface metadata for the tab title + social cards.
	// A missing/private backlog degrades to the default head; the component's
	// own not-found UI takes over from there.
	loader: async ({ context, params }) => {
		try {
			const backlog = await context.queryClient.ensureQueryData(
				publicBacklogQueryOptions(params.username),
			);
			const cover =
				backlog.games.find((g) => g.pinnedAt)?.coverUrl ??
				backlog.games[0]?.coverUrl ??
				null;
			return { username: backlog.username, image: cover };
		} catch {
			// Drop the rejected query so it isn't dehydrated to the client as a
			// pending-then-rejecting promise; the client refetches and renders the
			// not-found state cleanly.
			context.queryClient.removeQueries({
				queryKey: publicBacklogQueryOptions(params.username).queryKey,
			});
			return { username: null, image: null };
		}
	},
	head: ({ loaderData }) => {
		if (!loaderData?.username) return {};
		const title = `${loaderData.username}'s backlog - Backlogify`;
		const description = `See the games ${loaderData.username} is playing, has finished, and means to get to.`;
		const { image } = loaderData;
		return {
			meta: [
				{ title },
				{ property: "og:title", content: title },
				{ property: "og:type", content: "website" },
				{ name: "description", content: description },
				{ property: "og:description", content: description },
				{ name: "twitter:description", content: description },
				...(image
					? [
							{ property: "og:image", content: image },
							{ name: "twitter:image", content: image },
						]
					: []),
				{
					name: "twitter:card",
					content: image ? "summary_large_image" : "summary",
				},
				{ name: "twitter:title", content: title },
			],
		};
	},
	component: PublicBacklogPage,
});

function PublicBacklogPage() {
	const { username } = useParams({ from: "/u/$username" });
	const [statusFilter, setStatusFilter] = useState<FilterOption>("all");
	const query = useQuery(publicBacklogQueryOptions(username));

	if (query.isLoading) {
		return (
			<div className="mx-auto w-full max-w-6xl px-6 py-10">
				<p className="text-muted-foreground">Loading backlog…</p>
			</div>
		);
	}

	if (query.error instanceof BacklogNotFoundError) {
		return (
			<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-6 py-24 text-center">
				<div className="border-border bg-card flex size-14 items-center justify-center rounded-2xl border">
					<Gamepad2 className="text-muted-foreground size-7" />
				</div>
				<div>
					<p className="font-medium">No public backlog here</p>
					<p className="text-muted-foreground mt-1 text-sm">
						This backlog doesn&apos;t exist or isn&apos;t shared.
					</p>
				</div>
				<Button size="sm" asChild>
					<Link to="/games">
						<Search className="size-4" />
						Browse games
					</Link>
				</Button>
			</div>
		);
	}

	if (query.isError) {
		return (
			<div className="mx-auto w-full max-w-6xl px-6 py-10">
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{query.error.message}</AlertDescription>
				</Alert>
				<Button
					variant="outline"
					size="sm"
					onClick={() => query.refetch()}
					className="mt-3"
				>
					<RotateCw className="size-4" />
					Try again
				</Button>
			</div>
		);
	}

	const backlog = query.data;
	const games = backlog?.games ?? [];
	const displayName = backlog?.username ?? username;
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
			<div>
				<p className="text-primary text-xs font-semibold uppercase tracking-widest">
					Public backlog
				</p>
				<h1 className="font-display mt-1 text-3xl font-bold tracking-tight">
					{displayName}
				</h1>
				<p className="text-muted-foreground mt-1 text-sm">
					{games.length === 1 ? "1 game" : `${games.length} games`}
				</p>
			</div>

			{games.length === 0 ? (
				<p className="text-muted-foreground mt-16 text-center">
					This backlog is empty.
				</p>
			) : (
				<>
					{upNext && <UpNextCard game={upNext} readOnly />}
					<LibraryStats games={games} />
					<div className="mt-6">
						<StatusFilter
							value={statusFilter}
							onChange={setStatusFilter}
							counts={counts}
						/>
					</div>
					<PublicGameList games={games} statusFilter={statusFilter} />
				</>
			)}
		</div>
	);
}
