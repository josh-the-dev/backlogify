import type { GameSearchResult } from "@backlogify/types";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GameCard } from "./GameCard";

interface GameListProps {
	query: UseQueryResult<GameSearchResult[], Error>;
}

export function GameList({ query }: GameListProps) {
	if (query.isLoading) {
		return <p className="mt-8 text-center text-gray-600">Loading games...</p>;
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
		<ul className="mt-8 grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
