import type { GameSearchResult } from "@backlogify/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { UseQueryResult } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { GameCard } from "./GameCard";

const GRID_CLASSES =
	"grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6";

const grid = {
	hidden: {},
	show: { transition: { staggerChildren: 0.03 } },
};

const card = {
	hidden: { opacity: 0, y: 16 },
	show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

function GameCardSkeleton() {
	return (
		<li>
			<Skeleton className="aspect-[3/4] w-full rounded-lg" />
			<Skeleton className="mt-2 h-4 w-3/4" />
			<Skeleton className="mt-1.5 h-3 w-1/3" />
		</li>
	);
}

interface GameListProps {
	query: UseQueryResult<GameSearchResult[], Error>;
}

export function GameList({ query }: GameListProps) {
	if (query.isLoading) {
		return (
			<ul className={cn("mt-6", GRID_CLASSES)}>
				{Array.from({ length: 12 }).map((_, i) => (
					<GameCardSkeleton key={`skeleton-${i}`} />
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

	if (!query.data?.length) {
		return (
			<p className="mt-12 text-muted-foreground">
				No games found. Try a different name, or fewer words.
			</p>
		);
	}

	return (
		<motion.ul
			variants={grid}
			initial="hidden"
			animate="show"
			className={cn(
				"mt-6 transition-opacity duration-200",
				GRID_CLASSES,
				query.isFetching && "opacity-60",
			)}
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
