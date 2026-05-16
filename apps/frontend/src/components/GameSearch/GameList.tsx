import type { GameSearchResult } from "@backlogify/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GameCard } from "./GameCard";

const grid = {
	hidden: {},
	show: { transition: { staggerChildren: 0.04 } },
};

const card = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function GameCardSkeleton() {
	return <Skeleton className="h-64 w-40 rounded-lg" />;
}

interface GameListProps {
	query: UseQueryResult<GameSearchResult[], Error>;
}

export function GameList({ query }: GameListProps) {
	if (query.isLoading) {
		return (
			<ul className="mt-8 grid justify-items-center gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
				{Array.from({ length: 10 }).map((_, i) => (
					<GameCardSkeleton key={`skeleton-${i}`} />
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

	if (!query.data?.length) {
		return <p className="mt-8 text-center text-muted-foreground">No games found.</p>;
	}

	return (
		<motion.ul
			variants={grid}
			initial="hidden"
			animate="show"
			className="mt-8 grid justify-items-center gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
		>
			{query.data.map((game) => (
				<motion.li key={game.id} variants={card}>
					<Link
						to="/games/$id"
						params={{ id: game.id.toString() }}
						className="block rounded-lg"
					>
						<GameCard game={game} />
					</Link>
				</motion.li>
			))}
		</motion.ul>
	);
}
