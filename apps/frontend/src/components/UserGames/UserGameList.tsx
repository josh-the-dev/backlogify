import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameStatus, UserGame } from "@backlogify/types";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { UserGameCard } from "./UserGameCard";

const STATUS_ORDER: Record<GameStatus, number> = {
	backlog: 0,
	playing: 1,
	played: 2,
};

const list = {
	hidden: {},
	show: { transition: { staggerChildren: 0.05 } },
};

const row = {
	hidden: { opacity: 0, x: -12 },
	show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
	exit: { opacity: 0, x: 12, transition: { duration: 0.15 } },
};

function UserGameCardSkeleton() {
	return <Skeleton className="h-14 w-full rounded-lg" />;
}

interface UserGameListProps {
	query: UseQueryResult<UserGame[], Error>;
	statusFilter: GameStatus | "all";
}

export function UserGameList({ query, statusFilter }: UserGameListProps) {
	if (query.isLoading) {
		return (
			<ul className="mt-8 flex flex-col gap-3">
				{Array.from({ length: 8 }).map((_, i) => (
					<UserGameCardSkeleton key={`skeleton-${i}`} />
				))}
			</ul>
		);
	}

	if (query.isError) {
		return (
			<Alert variant="destructive" className="mt-8">
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
			<div className="mt-8 text-center">
				<p className="text-muted-foreground">Your library is empty.</p>
				<Link to="/games" className="mt-2 inline-block text-primary hover:underline">
					Search for games to add
				</Link>
			</div>
		);
	}

	if (filteredGames.length === 0) {
		return (
			<p className="mt-8 text-center text-muted-foreground">
				No games with status &quot;{statusFilter}&quot;.
			</p>
		);
	}

	return (
		<motion.ul
			variants={list}
			initial="hidden"
			animate="show"
			className="mt-8 flex flex-col gap-3"
		>
			<AnimatePresence>
				{filteredGames.map((game) => (
					<motion.li key={game.id} variants={row} exit="exit" layout>
						<UserGameCard game={game} />
					</motion.li>
				))}
			</AnimatePresence>
		</motion.ul>
	);
}
