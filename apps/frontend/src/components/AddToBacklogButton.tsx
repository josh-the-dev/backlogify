import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { STATUS_DOT_CLASSES, STATUS_OPTIONS } from "@/constants/game-status";
import { cn } from "@/lib/utils";
import type { GameStatus, UserGame } from "@backlogify/types";
import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	useAddUserGame,
	useRemoveUserGame,
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
	const removeGame = useRemoveUserGame();
	const userGamesQuery = useQuery(userGamesQueryOptions());
	const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

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

	const handleRemove = () => {
		if (gameInLibrary) {
			removeGame.mutate(gameInLibrary.id, {
				onSuccess: () => setRemoveDialogOpen(false),
			});
		}
	};

	const isUpdating = updateStatus.isPending || removeGame.isPending;
	const buttonSize = size === "sm" ? "sm" : "default";
	const selectSize = size === "sm" ? "h-8 text-xs" : "h-9";

	// Show nothing while loading to prevent flash
	if (userGamesQuery.isLoading) {
		return null;
	}

	if (gameInLibrary) {
		return (
			<div className="flex items-center gap-1.5">
				<Select
					value={gameInLibrary.status}
					onValueChange={handleStatusChange}
					disabled={isUpdating}
				>
					<SelectTrigger
						className={`w-[130px] border-primary/50 bg-primary/10 ${selectSize}`}
						onClick={(e: React.MouseEvent) => e.stopPropagation()}
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{STATUS_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								<span
									aria-hidden
									className={cn(
										"size-2 rounded-full",
										STATUS_DOT_CLASSES[option.value],
									)}
								/>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
					<DialogTrigger asChild>
						<Button
							variant="ghost"
							size={size === "sm" ? "icon-sm" : "icon"}
							disabled={isUpdating}
							aria-label={`Remove ${name} from library`}
							title="Remove from library"
							className="text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="size-4" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Remove from library</DialogTitle>
							<DialogDescription>
								Remove &quot;{name}&quot; from your library? This can&apos;t be
								undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={handleRemove}
								disabled={removeGame.isPending}
							>
								{removeGame.isPending ? "Removing…" : "Remove"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
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
