import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserGame } from "@backlogify/types";
import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start";
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
				className="bg-status-played/20 text-status-played"
			>
				<Check className="size-3" />
				In Library
			</Badge>
		);
	}

	const buttonSize = size === "sm" ? "sm" : "default";

	return (
		<>
			<SignedIn>
				<Button
					size={buttonSize}
					onClick={handleAdd}
					disabled={addGame.isPending}
				>
					<Plus className="size-4" />
					{addGame.isPending ? "Adding..." : "Add to Backlog"}
				</Button>
			</SignedIn>
			<SignedOut>
				<SignInButton mode="modal">
					<Button size={buttonSize}>
						<Plus className="size-4" />
						Add to Backlog
					</Button>
				</SignInButton>
			</SignedOut>
		</>
	);
}
