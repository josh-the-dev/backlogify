import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
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
	const { query: initialQuery = "Zelda" } = useSearch({ from: "/games/" });
	const [query, setQuery] = useState(initialQuery);

	const gamesQuery = useQuery(gamesQueryOptions(query));

	const handleSearchSubmit = (newQuery: string) => {
		setQuery(newQuery);

		const params = new URLSearchParams(window.location.search);
		params.set("query", newQuery);
		window.history.replaceState({}, "", `?${params.toString()}`);
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
