import type { GameStatus, UserGame } from "@backlogify/types";
import { AnimatePresence, motion } from "motion/react";
import { PublicGameCard } from "./PublicGameCard";

const GRID_CLASSES =
	"grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6";

const STATUS_ORDER: Record<GameStatus, number> = {
	playing: 0,
	backlog: 1,
	played: 2,
	abandoned: 3,
};

const list = {
	hidden: {},
	show: { transition: { staggerChildren: 0.03 } },
};

const tile = {
	hidden: { opacity: 0, y: 16 },
	show: {
		opacity: 1,
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 24 },
	},
	exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

interface PublicGameListProps {
	games: UserGame[];
	statusFilter: GameStatus | "all";
}

export function PublicGameList({ games, statusFilter }: PublicGameListProps) {
	const filteredGames =
		statusFilter === "all"
			? [...games].sort(
					(a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
				)
			: games.filter((g) => g.status === statusFilter);

	if (filteredGames.length === 0) {
		return (
			<p className="text-muted-foreground mt-12 text-center">
				Nothing here under this filter.
			</p>
		);
	}

	return (
		<motion.ul
			variants={list}
			initial="hidden"
			animate="show"
			className={`mt-6 ${GRID_CLASSES}`}
		>
			<AnimatePresence>
				{filteredGames.map((game) => (
					<motion.li key={game.id} variants={tile} exit="exit" layout>
						<PublicGameCard game={game} />
					</motion.li>
				))}
			</AnimatePresence>
		</motion.ul>
	);
}
