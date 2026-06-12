import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import z from "zod";
import { Button } from "../../components/ui/button";
import { GameList } from "../../components/GameSearch/GameList";
import { GameSearchForm } from "../../components/GameSearch/GameSearchForm";
import {
	gamesSearchQueryOptions,
	popularGamesQueryOptions,
} from "../../queries/games";

const searchSchema = z.object({
	query: z.string().optional(),
});

export const Route = createFileRoute("/games/")({
	component: GamesPage,
	validateSearch: (search) => searchSchema.parse(search),
});

function GamesPage() {
	const { query } = useSearch({ from: "/games/" });
	const navigate = useNavigate({ from: "/games/" });

	const searchQuery = useInfiniteQuery(gamesSearchQueryOptions(query ?? ""));
	const popularQuery = useInfiniteQuery(popularGamesQueryOptions());

	const handleSearch = (newQuery: string) => {
		navigate({
			search: newQuery ? { query: newQuery } : {},
			replace: true,
		});
	};

	const searchResults = searchQuery.data?.pages.flat();
	const resultCount = searchResults?.length;

	return (
		<div className="mx-auto w-full max-w-6xl px-6 py-10">
			<h1 className="font-display font-bold text-3xl tracking-tight">
				Find your next game
			</h1>
			<div className="mt-5">
				<GameSearchForm defaultValue={query ?? ""} onSearch={handleSearch} />
			</div>

			{query ? (
				<>
					<div className="mt-10 flex items-baseline gap-3">
						<h2 className="font-semibold text-lg">
							Results for &ldquo;{query}&rdquo;
						</h2>
						{resultCount !== undefined && (
							<span className="text-muted-foreground text-sm tabular-nums">
								{resultCount}
								{searchQuery.hasNextPage ? "+" : ""}{" "}
								{resultCount === 1 ? "game" : "games"}
							</span>
						)}
					</div>
					<GameList
						games={searchResults}
						isLoading={searchQuery.isLoading}
						isError={searchQuery.isError}
						error={searchQuery.error}
						isFetching={searchQuery.isFetching && !searchQuery.isFetchingNextPage}
					/>
					{searchQuery.hasNextPage && (
						<div className="mt-8 flex justify-center">
							<Button
								variant="outline"
								onClick={() => searchQuery.fetchNextPage()}
								disabled={searchQuery.isFetchingNextPage}
							>
								{searchQuery.isFetchingNextPage ? "Loading..." : "Load more"}
							</Button>
						</div>
					)}
				</>
			) : (
				<>
					<h2 className="mt-10 font-semibold text-lg">Popular right now</h2>
					<GameList
						games={popularQuery.data?.pages.flat()}
						isLoading={popularQuery.isLoading}
						isError={popularQuery.isError}
						error={popularQuery.error}
					/>
					{popularQuery.hasNextPage && (
						<div className="mt-8 flex justify-center">
							<Button
								variant="outline"
								onClick={() => popularQuery.fetchNextPage()}
								disabled={popularQuery.isFetchingNextPage}
							>
								{popularQuery.isFetchingNextPage ? "Loading..." : "Load more"}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
