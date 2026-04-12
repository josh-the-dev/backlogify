import type { GameSearchResult } from "@backlogify/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GameCard } from "./GameCard";

function GameCardSkeleton() {
	return <Skeleton className="h-64 w-40 rounded-lg" />;
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
			<Alert variant="destructive" className="mt-8">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{query.error.message}</AlertDescription>
			</Alert>
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
