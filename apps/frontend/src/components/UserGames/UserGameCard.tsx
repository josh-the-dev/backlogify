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
import { format } from "date-fns";
import { Pin, Trash2 } from "lucide-react";
import { useState } from "react";
import {
	useRemoveUserGame,
	useUpdateUserGamePin,
	useUpdateUserGameStatus,
} from "../../queries/user-games";
import { GameCover } from "../GameSearch/GameCover";

export function UserGameCard({ game }: { game: UserGame }) {
	const updateStatus = useUpdateUserGameStatus();
	const updatePin = useUpdateUserGamePin();
	const removeGame = useRemoveUserGame();
	const [open, setOpen] = useState(false);

	const handleStatusChange = (newStatus: GameStatus) => {
		updateStatus.mutate({ gameId: game.id, status: newStatus });
	};

	const handleRemove = () => {
		removeGame.mutate(game.id, { onSuccess: () => setOpen(false) });
	};

	const isUpdating =
		updateStatus.isPending || updatePin.isPending || removeGame.isPending;
	const isPinned = Boolean(game.pinnedAt);
	// Pinning a finished or abandoned game makes no sense; the backend
	// clears the pin on those status changes anyway
	const canPin = game.status === "backlog" || game.status === "playing";

	return (
		<div className="group">
			<div className="border-border/60 bg-card group-hover:border-primary/60 relative overflow-hidden rounded-lg border transition-colors duration-200">
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

				{canPin && (
					<button
						type="button"
						onClick={() =>
							updatePin.mutate({ gameId: game.id, pinned: !isPinned })
						}
						disabled={isUpdating}
						aria-label={
							isPinned
								? `Unpin ${game.name} from Up next`
								: `Pin ${game.name} as Up next`
						}
						title={isPinned ? "Unpin from Up next" : "Play this next"}
						className={cn(
							"absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded-md backdrop-blur-sm transition-all disabled:pointer-events-none",
							isPinned
								? "bg-primary text-primary-foreground"
								: "hover:bg-primary hover:text-primary-foreground bg-black/60 text-white/80 opacity-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
						)}
					>
						<Pin className="size-3.5" />
					</button>
				)}

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogTrigger asChild>
						<button
							type="button"
							disabled={isUpdating}
							aria-label={`Remove ${game.name} from library`}
							title="Remove from library"
							className="hover:bg-destructive absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-md bg-black/60 text-white/80 opacity-100 backdrop-blur-sm transition-all hover:text-white focus-visible:opacity-100 disabled:pointer-events-none sm:opacity-0 sm:group-hover:opacity-100"
						>
							<Trash2 className="size-3.5" />
						</button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Remove from library</DialogTitle>
							<DialogDescription>
								Remove &quot;{game.name}&quot; from your library? This
								can&apos;t be undone.
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

			<h3 className="mt-2 line-clamp-1 text-sm font-medium" title={game.name}>
				{game.name}
			</h3>
			<Select
				value={game.status}
				onValueChange={(value: string) =>
					handleStatusChange(value as GameStatus)
				}
				disabled={isUpdating}
			>
				<SelectTrigger
					size="sm"
					className="text-muted-foreground hover:text-foreground dark:hover:bg-accent/50 -ml-2 mt-0.5 h-7 gap-1.5 border-0 bg-transparent px-2 text-xs shadow-none dark:bg-transparent"
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
			{game.status === "played" && game.finishedAt && (
				<p className="text-muted-foreground text-xs">
					Finished {format(new Date(game.finishedAt), "d MMM yyyy")}
				</p>
			)}
			{game.note && (
				<p
					className="text-muted-foreground line-clamp-1 text-xs italic"
					title={game.note}
				>
					{game.note}
				</p>
			)}
		</div>
	);
}
