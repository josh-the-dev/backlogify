import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Game, searchGames } from "@/api/games";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Game[]>([]);
	const [loading, setLoading] = useState(false);

	async function handleSearch() {
		setLoading(true);
		try {
			const games = await searchGames(query);
			console.log(games);
			setResults(games);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="text-center">
			<header className="min-h-screen flex flex-col items-center justify-center bg-[#282c34] text-white text-[calc(10px+2vmin)]">
				<input
					type="text"
					placeholder="Search games..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					className="mb-4 p-2 rounded text-black"
				/>
				<button
					type="button"
					onClick={handleSearch}
					disabled={loading || !query}
					className="mb-4 px-4 py-2 bg-blue-600 rounded disabled:opacity-50"
				>
					{loading ? "Searching..." : "Search"}
				</button>
				<ul>
					{results.map((game) => (
						<li key={game.id}>{game.name}</li>
					))}
				</ul>
			</header>
		</div>
	);
}
