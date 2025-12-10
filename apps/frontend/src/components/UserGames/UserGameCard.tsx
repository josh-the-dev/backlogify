import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
		<Card className="w-full max-w-64">
			<CardHeader className="pb-2">
				<CardTitle className="line-clamp-2 h-14 text-center text-lg">{game.name}</CardTitle>
			</CardHeader>
			<CardContent className="flex justify-center">
				<GameCover name={game.name} coverUrl={game.coverUrl ?? null} />
			</CardContent>
			<CardFooter className="flex-col gap-2">
				<Select
					value={game.status}
					onValueChange={(value: string) =>
						handleStatusChange(value as GameStatus)
					}
					disabled={isUpdating}
				>
					<SelectTrigger className="w-full border-primary/50 bg-primary/10">
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
					size="sm"
					onClick={handleRemove}
					disabled={isUpdating}
					className="w-full"
				>
					<Trash2 className="size-4" />
					Remove
				</Button>
			</CardFooter>
		</Card>
	);
}
