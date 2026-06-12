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
import { Link } from "@tanstack/react-router";
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
		<div className="group">
			<div className="relative overflow-hidden rounded-lg border border-border/60 bg-card transition-colors duration-200 group-hover:border-primary/60">
				<Link
					to="/games/$id"
					params={{ id: game.externalServiceId }}
					aria-label={`View ${game.name}`}
					className="block"
				>
					<GameCover
						name={game.name}
						coverUrl={game.coverUrl ?? null}
						className="aspect-[3/4] w-full transition-transform duration-300 group-hover:scale-[1.04]"
					/>
				</Link>

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<button
							type="button"
							disabled={isUpdating}
							aria-label={`Remove ${game.name} from library`}
							title="Remove from library"
							className="absolute top-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-black/60 text-white/80 opacity-100 backdrop-blur-sm transition-all hover:bg-destructive hover:text-white focus-visible:opacity-100 disabled:pointer-events-none sm:opacity-0 sm:group-hover:opacity-100"
						>
							<Trash2 className="size-3.5" />
						</button>
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

			<h3 className="mt-2 line-clamp-1 font-medium text-sm" title={game.name}>
				{game.name}
			</h3>
			<Select
				value={game.status}
				onValueChange={(value: string) => handleStatusChange(value as GameStatus)}
				disabled={isUpdating}
			>
				<SelectTrigger
					size="sm"
					className="-ml-2 mt-0.5 h-7 gap-1.5 border-0 bg-transparent px-2 text-muted-foreground text-xs shadow-none hover:text-foreground dark:bg-transparent dark:hover:bg-accent/50"
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
		</div>
	);
}
