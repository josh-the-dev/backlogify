import type { GameSearchResult } from "@backlogify/types";
import { Skeleton } from "@/components/ui/skeleton";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GameCard } from "./GameCard";

function GameCardSkeleton() {
	return <Skeleton className="h-52 w-40 rounded-lg" />;
}

interface GameListProps {
	query: UseQueryResult<GameSearchResult[], Error>;
}

export function GameList({ query }: GameListProps) {
	if (query.isLoading) {
		return (
			<ul className="mt-8 grid justify-items-center gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{Array.from({ length: 10 }).map((_, i) => (
					<GameCardSkeleton key={`skeleton-${i}`} />
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

	if (!query.data?.length) {
		return <p className="mt-8 text-center text-gray-500">No games found.</p>;
	}

	return (
		<ul className="mt-8 grid justify-items-center gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{query.data.map((game) => (
				<Link
					key={game.id}
					to="/games/$id"
					params={{ id: game.id.toString() }}
					className="block rounded-lg shadow transition hover:shadow-lg"
				>
					<GameCard game={game} />
				</Link>
			))}
		</ul>
	);
}
