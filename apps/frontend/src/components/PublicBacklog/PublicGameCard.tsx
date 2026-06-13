import { STATUS_DOT_CLASSES, STATUS_OPTIONS } from "@/constants/game-status";
import { cn } from "@/lib/utils";
import type { UserGame } from "@backlogify/types";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Pin } from "lucide-react";
import { GameCover } from "../GameSearch/GameCover";

/**
 * Display-only counterpart to UserGameCard for the public /u/:username page.
 * No mutation hooks, selects or dialogs - just the cover (linking into the
 * game page), name, status and any note.
 */
export function PublicGameCard({ game }: { game: UserGame }) {
	const statusLabel = STATUS_OPTIONS.find(
		(o) => o.value === game.status,
	)?.label;
	const isPinned = Boolean(game.pinnedAt);

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

				{isPinned && (
					<span
						title="Up next"
						className="bg-primary text-primary-foreground absolute left-1.5 top-1.5 flex size-7 items-center justify-center rounded-md backdrop-blur-sm"
					>
						<Pin className="size-3.5" />
						<span className="sr-only">Up next</span>
					</span>
				)}
			</div>

			<h3 className="mt-2 line-clamp-1 text-sm font-medium" title={game.name}>
				{game.name}
			</h3>
			<p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
				<span
					aria-hidden
					className={cn("size-2 rounded-full", STATUS_DOT_CLASSES[game.status])}
				/>
				{statusLabel}
			</p>
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
