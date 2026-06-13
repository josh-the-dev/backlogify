import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GameDetails } from "../../components/GameDetails/GameDetails";
import { GameDetailsError } from "../../components/GameDetails/GameDetailsError";
import { GameDetailsLoading } from "../../components/GameDetails/GameDetailsLoading";
import { gameDetailsQueryOptions } from "../../queries/games";

export const Route = createFileRoute("/games/$id")({
	// Warm the query cache and surface the game name so `head` can set the tab
	// title declaratively. Failures degrade to the default title rather than
	// throwing, leaving the component's own error UI to handle the load.
	loader: async ({ context, params }) => {
		try {
			const game = await context.queryClient.ensureQueryData(
				gameDetailsQueryOptions(params.id),
			);
			return { title: game.name };
		} catch {
			return { title: null };
		}
	},
	head: ({ loaderData }) =>
		loaderData?.title
			? { meta: [{ title: `${loaderData.title} - Backlogify` }] }
			: {},
	component: GameDetailsPage,
});

function GameDetailsPage() {
	const { id } = useParams({ from: "/games/$id" });
	const gameQuery = useQuery(gameDetailsQueryOptions(id));

	if (gameQuery.isLoading) return <GameDetailsLoading />;
	if (gameQuery.isError)
		return <GameDetailsError message={gameQuery.error.message} />;

	if (!gameQuery.data) return <GameDetailsError message="Game not found." />;

	return <GameDetails game={gameQuery.data} />;
}
