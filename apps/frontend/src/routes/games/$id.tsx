import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GameDetails } from "../../components/GameDetails/GameDetails";
import { GameDetailsError } from "../../components/GameDetails/GameDetailsError";
import { GameDetailsLoading } from "../../components/GameDetails/GameDetailsLoading";
import { gameDetailsQueryOptions } from "../../queries/games";

export const Route = createFileRoute("/games/$id")({
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
