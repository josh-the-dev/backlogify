import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { STATUS_OPTIONS } from "@/constants/game-status";
import type { GameStatus, UserGame } from "@backlogify/types";
import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
	useAddUserGame,
	useUpdateUserGameStatus,
	userGamesQueryOptions,
} from "../queries/user-games";

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
	const updateStatus = useUpdateUserGameStatus();
	const userGamesQuery = useQuery(userGamesQueryOptions());

	const gameInLibrary = userGamesQuery.data?.find(
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

	const handleStatusChange = (newStatus: GameStatus) => {
		if (gameInLibrary) {
			updateStatus.mutate({ gameId: gameInLibrary.id, status: newStatus });
		}
	};

	const isUpdating = updateStatus.isPending;
	const buttonSize = size === "sm" ? "sm" : "default";
	const selectSize = size === "sm" ? "h-8 text-xs" : "h-9";

	// Show nothing while loading to prevent flash
	if (userGamesQuery.isLoading) {
		return null;
	}

	if (gameInLibrary) {
		return (
			<Select
				value={gameInLibrary.status}
				onValueChange={handleStatusChange}
				disabled={isUpdating}
			>
				<SelectTrigger
					className={`w-[130px] border-primary/50 bg-primary/10 ${selectSize}`}
					onClick={(e) => e.stopPropagation()}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{STATUS_OPTIONS.map((option) => (
						<SelectItem key={option.value} value={option.value}>
							{option.label}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		);
	}

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
