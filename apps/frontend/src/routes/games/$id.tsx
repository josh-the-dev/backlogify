import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { GameDetails } from "../../components/GameDetails/GameDetails";
import { GameDetailsError } from "../../components/GameDetails/GameDetailsError";
import { GameDetailsLoading } from "../../components/GameDetails/GameDetailsLoading";
import { addRecentlyViewed } from "../../lib/recently-viewed";
import { gameDetailsQueryOptions } from "../../queries/games";

/** RAWG descriptions are HTML; flatten to plain text for meta tags. */
function toMetaDescription(html: string | null, max = 200): string | null {
	if (!html) return null;
	const text = html
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	if (!text) return null;
	return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export const Route = createFileRoute("/games/$id")({
	// Warm the query cache, record the view for the "recently viewed" shelf, and
	// surface metadata so `head` can set the tab title and social cards
	// declaratively. Failures degrade to the default head rather than throwing,
	// leaving the component's own error UI to handle the load.
	loader: async ({ context, params }) => {
		try {
			const game = await context.queryClient.ensureQueryData(
				gameDetailsQueryOptions(params.id),
			);
			addRecentlyViewed({
				id: game.id,
				name: game.name,
				coverUrl: game.coverUrl,
				releaseDate: game.releaseDate,
				metacritic: null,
			});
			return {
				title: game.name,
				description: toMetaDescription(game.description),
				image: game.coverUrl,
			};
		} catch {
			return { title: null, description: null, image: null };
		}
	},
	head: ({ loaderData }) => {
		if (!loaderData?.title) return {};
		const title = `${loaderData.title} - Backlogify`;
		const { description, image } = loaderData;
		return {
			meta: [
				{ title },
				{ property: "og:title", content: title },
				{ property: "og:type", content: "website" },
				...(description
					? [
							{ name: "description", content: description },
							{ property: "og:description", content: description },
							{ name: "twitter:description", content: description },
						]
					: []),
				...(image
					? [
							{ property: "og:image", content: image },
							{ name: "twitter:image", content: image },
						]
					: []),
				{
					name: "twitter:card",
					content: image ? "summary_large_image" : "summary",
				},
				{ name: "twitter:title", content: title },
			],
		};
	},
	component: GameDetailsPage,
});

function GameDetailsPage() {
	const { id } = useParams({ from: "/games/$id" });
	const gameQuery = useQuery(gameDetailsQueryOptions(id));

	if (gameQuery.isLoading) return <GameDetailsLoading />;
	if (gameQuery.isError)
		return (
			<GameDetailsError
				message={gameQuery.error.message}
				onRetry={() => gameQuery.refetch()}
			/>
		);

	if (!gameQuery.data) return <GameDetailsError message="Game not found." />;

	return <GameDetails game={gameQuery.data} />;
}
