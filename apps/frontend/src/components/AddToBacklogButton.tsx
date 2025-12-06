import type { UserGame } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { useAddUserGame, userGamesQueryOptions } from "../queries/user-games";

interface AddToBacklogButtonProps {
	externalServiceId: string;
	name: string;
	coverUrl?: string | null;
	size?: "sm" | "md";
}

export function AddToBacklogButton({
	externalServiceId,
	name,
	coverUrl,
	size = "md",
}: AddToBacklogButtonProps) {
	const addGame = useAddUserGame();
	const userGamesQuery = useQuery(userGamesQueryOptions());

	const isInLibrary = userGamesQuery.data?.some(
		(g: UserGame) => g.externalServiceId === externalServiceId,
	);

	const handleAdd = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		addGame.mutate({
			externalServiceId,
			name,
			coverUrl: coverUrl ?? undefined,
			status: "backlog",
		});
	};

	if (isInLibrary) {
		return (
			<span
				className={`inline-flex items-center rounded-lg bg-green-100 font-medium text-green-700 ${
					size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
				}`}
			>
				In Library
			</span>
		);
	}

	return (
		<button
			type="button"
			onClick={handleAdd}
			disabled={addGame.isPending}
			className={`inline-flex items-center rounded-lg bg-blue-600 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 ${
				size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"
			}`}
		>
			{addGame.isPending ? "Adding..." : "+ Add to Backlog"}
		</button>
	);
}
