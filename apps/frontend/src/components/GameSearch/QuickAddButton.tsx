import type { GameSearchResult, UserGame } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
import { useAddUserGame, userGamesQueryOptions } from "../../queries/user-games";

/**
 * Compact one-click "add to backlog" control overlaid on search result
 * covers. Only render this for signed-in users, since the library query 401s
 * otherwise.
 */
export function QuickAddButton({ game }: { game: GameSearchResult }) {
	const addGame = useAddUserGame();
	const userGamesQuery = useQuery(userGamesQueryOptions());

	const inLibrary = userGamesQuery.data?.some(
		(g: UserGame) => g.externalServiceId === game.id.toString(),
	);

	if (userGamesQuery.isLoading) return null;

	if (inLibrary) {
		return (
			<span
				title="In your library"
				className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-black/60 text-status-played backdrop-blur-sm"
			>
				<Check className="size-4" />
			</span>
		);
	}

	const handleAdd = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		addGame.mutate({
			externalServiceId: game.id.toString(),
			name: game.name,
			coverUrl: game.coverUrl ?? undefined,
			status: "backlog",
		});
	};

	return (
		<button
			type="button"
			onClick={handleAdd}
			disabled={addGame.isPending}
			aria-label={`Add ${game.name} to backlog`}
			title="Add to backlog"
			className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-black/60 text-white/90 opacity-100 backdrop-blur-sm transition-all hover:bg-primary hover:text-primary-foreground focus-visible:opacity-100 disabled:pointer-events-none sm:opacity-0 sm:group-hover:opacity-100"
		>
			<Plus className="size-4" />
		</button>
	);
}
