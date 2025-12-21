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
import { Trash2 } from "lucide-react";
import {
	useRemoveUserGame,
	useUpdateUserGameStatus,
} from "../../queries/user-games";
import { GameCover } from "../GameSearch/GameCover";

export function UserGameCard({ game }: { game: UserGame }) {
	const updateStatus = useUpdateUserGameStatus();
	const removeGame = useRemoveUserGame();

	const handleStatusChange = (newStatus: GameStatus) => {
		updateStatus.mutate({ gameId: game.id, status: newStatus });
	};

	const handleRemove = () => {
		if (confirm(`Remove "${game.name}" from your library?`)) {
			removeGame.mutate(game.id);
		}
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

				<Button
					variant="destructive"
					size="icon"
					onClick={handleRemove}
					disabled={isUpdating}
					className="shrink-0"
				>
					<Trash2 className="size-4" />
				</Button>
			</div>
		</div>
	);
}
