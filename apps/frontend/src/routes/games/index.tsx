import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import z from "zod";
import { GameList } from "../../components/GameSearch/GameList";
import { GameSearchForm } from "../../components/GameSearch/GameSearchForm";
import { gamesQueryOptions } from "../../queries/games";

const searchSchema = z.object({
	query: z.string().optional(),
});

export const Route = createFileRoute("/games/")({
	component: GamesPage,
	validateSearch: (search) => searchSchema.parse(search),
});

function GamesPage() {
	const { query = "Elden Ring" } = useSearch({ from: "/games/" });
	const navigate = useNavigate({ from: "/games/" });

	const gamesQuery = useQuery(gamesQueryOptions(query));

	const handleSearchSubmit = (newQuery: string) => {
		navigate({ search: { query: newQuery } });
	};

	return (
		<div className="mx-auto max-w-6xl p-6">
			<h1 className="mb-6 text-center font-bold text-3xl tracking-tight">
				Game Search
			</h1>
			<GameSearchForm defaultValue={query} onSubmit={handleSearchSubmit} />
			<GameList query={gamesQuery} />
		</div>
	);
}
