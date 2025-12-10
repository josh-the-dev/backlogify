import { Skeleton } from "@/components/ui/skeleton";
import type { GameStatus, UserGame } from "@backlogify/types";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UserGameCard } from "./UserGameCard";

function UserGameCardSkeleton() {
	return <Skeleton className="h-52 w-40 rounded-lg" />;
}

interface UserGameListProps {
	query: UseQueryResult<UserGame[], Error>;
	statusFilter: GameStatus | "all";
}

export function UserGameList({ query, statusFilter }: UserGameListProps) {
	if (query.isLoading) {
		return (
			<ul className="mt-8 grid justify-items-center gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
				{Array.from({ length: 8 }).map((_, i) => (
					<UserGameCardSkeleton key={`skeleton-${i}`} />
				))}
			</ul>
		);
	}

	if (query.isError) {
		return (
			<p className="mt-8 text-center text-red-600">
				Error: {query.error.message}
			</p>
		);
	}

	const games = query.data ?? [];
	const filteredGames =
		statusFilter === "all"
			? games
			: games.filter((g) => g.status === statusFilter);

	if (games.length === 0) {
		return (
			<div className="mt-8 text-center">
				<p className="text-gray-500">Your library is empty.</p>
				<Link
					to="/games"
					className="mt-2 inline-block text-blue-600 hover:underline"
				>
					Search for games to add
				</Link>
			</div>
		);
	}

	if (filteredGames.length === 0) {
		return (
			<p className="mt-8 text-center text-gray-500">
				No games with status "{statusFilter}".
			</p>
		);
	}

	return (
		<ul className="mt-8 grid justify-items-center gap-6 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
			{filteredGames.map((game) => (
				<UserGameCard key={game.id} game={game} />
			))}
		</ul>
	);
}
