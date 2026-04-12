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
import { STATUS_OPTIONS } from "@/constants/game-status";
import type { GameStatus, UserGame } from "@backlogify/types";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
	useRemoveUserGame,
	useUpdateUserGameStatus,
} from "../../queries/user-games";
import { GameCover } from "../GameSearch/GameCover";

export function UserGameCard({ game }: { game: UserGame }) {
	const updateStatus = useUpdateUserGameStatus();
	const removeGame = useRemoveUserGame();
	const [open, setOpen] = useState(false);

	const handleStatusChange = (newStatus: GameStatus) => {
		updateStatus.mutate({ gameId: game.id, status: newStatus });
	};

	const handleRemove = () => {
		removeGame.mutate(game.id, { onSuccess: () => setOpen(false) });
	};

	const isUpdating = updateStatus.isPending || removeGame.isPending;

	return (
		<div className="flex flex-col items-center gap-3 rounded-lg border bg-card p-3 text-center sm:flex-row sm:items-center sm:gap-4 sm:text-left">
			<GameCover
				name={game.name}
				coverUrl={game.coverUrl ?? null}
				className="aspect-3/4 w-16 shrink-0 rounded sm:w-12"
			/>
			<span className="font-medium sm:min-w-0 sm:flex-1 sm:truncate">
				{game.name}
			</span>
			<div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
				<Select
					value={game.status}
					onValueChange={(value: string) =>
						handleStatusChange(value as GameStatus)
					}
					disabled={isUpdating}
				>
					<SelectTrigger className="flex-1 border-primary/50 bg-primary/10 sm:w-32 sm:flex-none">
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

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<Button
							variant="destructive"
							size="icon"
							disabled={isUpdating}
							className="shrink-0"
						>
							<Trash2 className="size-4" />
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Remove from library</DialogTitle>
							<DialogDescription>
								Remove &quot;{game.name}&quot; from your library? This can&apos;t be
								undone.
							</DialogDescription>
						</DialogHeader>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
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
		</div>
	);
}
