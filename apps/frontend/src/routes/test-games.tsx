import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { gamesQueryOptions } from "../queries/games";

export const Route = createFileRoute("/test-games")({
	component: TestGamesPage,
});

function TestGamesPage() {
	const [searchTerm, setSearchTerm] = useState("Zelda");
	const [submittedQuery, setSubmittedQuery] = useState("Zelda");

	const query = useQuery(gamesQueryOptions(submittedQuery));

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSubmittedQuery(searchTerm.trim());
	}

	return (
		<div className="space-y-4 p-4">
			<h1 className="font-bold text-xl">Game Search</h1>

			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-1 rounded border p-2"
					placeholder="Search for a game..."
				/>
				<button
					type="submit"
					className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
				>
					Search
				</button>
			</form>

			{/* Keep input visible, only reload results */}
			<div className="min-h-[200px]">
				{query.isLoading && <p>Loading...</p>}
				{query.isError && (
					<p className="text-red-600">
						Error: {(query.error as Error).message}
					</p>
				)}
				{query.data && (
					<ul className="space-y-2">
						{query.data.map((game) => (
							<li key={game.id} className="rounded border p-2">
								<strong>{game.name}</strong>
								{game.coverUrl && (
									<img
										src={game.coverUrl}
										alt={game.name}
										className="mt-2 w-32 rounded"
									/>
								)}
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
