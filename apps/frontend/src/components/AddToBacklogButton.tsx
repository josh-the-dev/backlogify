import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserGame } from "@backlogify/types";
import { useQuery } from "@tanstack/react-query";
import { Check, Plus } from "lucide-react";
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
			<Badge
				variant="secondary"
				className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
			>
				<Check className="size-3" />
				In Library
			</Badge>
		);
	}

	// TODO: show a different state if not signed in / use signinbutton from clerk
	return (
		<Button
			size={size === "sm" ? "sm" : "default"}
			onClick={handleAdd}
			disabled={addGame.isPending}
		>
			<Plus className="size-4" />
			{addGame.isPending ? "Adding..." : "Add to Backlog"}
		</Button>
	);
}
