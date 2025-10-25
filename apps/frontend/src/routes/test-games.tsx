import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GameList } from "../components/GameSearch/GameList";
import { GameSearchForm } from "../components/GameSearch/GameSearchForm";
import { gamesQueryOptions } from "../queries/games";

export const Route = createFileRoute("/test-games")({
	component: TestGamesPage,
});

function TestGamesPage() {
	const [query, setQuery] = useState("Zelda");
	const gamesQuery = useQuery(gamesQueryOptions(query));

	return (
		<div className="mx-auto max-w-6xl p-6">
			<h1 className="mb-6 text-center font-bold text-3xl tracking-tight">
				Game Search
			</h1>
			<GameSearchForm defaultValue={query} onSubmit={setQuery} />
			<GameList query={gamesQuery} />
		</div>
	);
}
