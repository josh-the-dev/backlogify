import { STATUS_DOT_CLASSES, STATUS_OPTIONS } from "@/constants/game-status";
import { cn } from "@/lib/utils";
import type { UserGame } from "@backlogify/types";
import { Link } from "@tanstack/react-router";
import { PinOff } from "lucide-react";
import { motion } from "motion/react";
import { useUpdateUserGamePin } from "../../queries/user-games";
import { GameCover } from "../GameSearch/GameCover";

/**
 * Hero slot at the top of My Games for the single pinned game. Render only
 * when a pinned game exists; an empty slot is just noise. On the public
 * /u/:username page it renders read-only (no unpin control).
 */
export function UpNextCard({
	game,
	readOnly = false,
}: {
	game: UserGame;
	readOnly?: boolean;
}) {
	const updatePin = useUpdateUserGamePin();

	return (
		<motion.section
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 26 }}
			aria-label="Up next"
			className="border-primary/40 from-primary/10 via-card to-card relative mt-8 overflow-hidden rounded-xl border bg-gradient-to-r"
		>
			<div className="flex gap-5 p-4 sm:gap-6 sm:p-5">
				<Link
					to="/games/$id"
					params={{ id: game.externalServiceId }}
					aria-label={`View ${game.name}`}
					className="shrink-0"
				>
					<GameCover
						name={game.name}
						coverUrl={game.coverUrl ?? null}
						className="aspect-[3/4] w-24 rounded-lg border border-white/10 shadow-lg transition-transform duration-300 hover:scale-[1.03] sm:w-32"
					/>
				</Link>
				<div className="min-w-0 flex-1 self-center py-1">
					<p className="text-primary text-xs font-semibold uppercase tracking-widest">
						Up next
					</p>
					<h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
						<Link
							to="/games/$id"
							params={{ id: game.externalServiceId }}
							className="hover:text-primary transition-colors"
						>
							{game.name}
						</Link>
					</h2>
					<p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
						<span
							aria-hidden
							className={cn(
								"size-2 rounded-full",
								STATUS_DOT_CLASSES[game.status],
							)}
						/>
						{STATUS_OPTIONS.find((o) => o.value === game.status)?.label}
					</p>
					{game.note && (
						<p
							className="text-muted-foreground mt-2 line-clamp-2 max-w-xl text-sm italic"
							title={game.note}
						>
							{game.note}
						</p>
					)}
				</div>
			</div>
			{!readOnly && (
				<button
					type="button"
					onClick={() => updatePin.mutate({ gameId: game.id, pinned: false })}
					disabled={updatePin.isPending}
					aria-label={`Unpin ${game.name} from Up next`}
					title="Unpin from Up next"
					className="text-muted-foreground hover:bg-accent hover:text-foreground absolute right-3 top-3 flex size-8 items-center justify-center rounded-md transition-colors disabled:pointer-events-none"
				>
					<PinOff className="size-4" />
				</button>
			)}
		</motion.section>
	);
}
