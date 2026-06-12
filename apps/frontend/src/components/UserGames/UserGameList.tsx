import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameStatus, UserGame } from "@backlogify/types";
import { AlertCircle, Gamepad2, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UserGameCard } from "./UserGameCard";

const GRID_CLASSES =
	"grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6";

const STATUS_ORDER: Record<GameStatus, number> = {
	backlog: 0,
	playing: 1,
	played: 2,
};

const EMPTY_FILTER_COPY: Record<GameStatus, string> = {
	backlog: "Nothing in your backlog. Go queue something up.",
	playing: "You're not playing anything right now.",
	played: "No finished games yet. One day.",
};

const list = {
	hidden: {},
	show: { transition: { staggerChildren: 0.03 } },
};

const tile = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
	exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

function UserGameCardSkeleton() {
	return (
		<li>
			<Skeleton className="aspect-[3/4] w-full rounded-lg" />
			<Skeleton className="mt-2 h-4 w-3/4" />
			<Skeleton className="mt-1.5 h-3 w-1/2" />
		</li>
	);
}

interface UserGameListProps {
	query: UseQueryResult<UserGame[], Error>;
	statusFilter: GameStatus | "all";
}

export function UserGameList({ query, statusFilter }: UserGameListProps) {
	if (query.isLoading) {
		return (
			<ul className={`mt-6 ${GRID_CLASSES}`}>
				{Array.from({ length: 10 }).map((_, i) => (
					<UserGameCardSkeleton key={`skeleton-${i}`} />
				))}
			</ul>
		);
	}

	if (query.isError) {
		return (
			<Alert variant="destructive" className="mt-6">
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>{query.error.message}</AlertDescription>
			</Alert>
		);
	}

	const games = query.data ?? [];
	const filteredGames =
		statusFilter === "all"
			? [...games].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
			: games.filter((g) => g.status === statusFilter);

	if (games.length === 0) {
		return (
			<div className="mt-16 flex flex-col items-center gap-5 text-center">
				<div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-card">
					<Gamepad2 className="size-7 text-muted-foreground" />
				</div>
				<div>
					<p className="font-medium">Your library is empty</p>
					<p className="mt-1 text-muted-foreground text-sm">
						Find the games you keep meaning to play and queue them up.
					</p>
				</div>
				<Button size="sm" asChild>
					<Link to="/games">
						<Search className="size-4" />
						Browse games
					</Link>
				</Button>
			</div>
		);
	}

	if (filteredGames.length === 0 && statusFilter !== "all") {
		return (
			<p className="mt-12 text-center text-muted-foreground">
				{EMPTY_FILTER_COPY[statusFilter]}
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
						<UserGameCard game={game} />
					</motion.li>
				))}
			</AnimatePresence>
		</motion.ul>
	);
}
