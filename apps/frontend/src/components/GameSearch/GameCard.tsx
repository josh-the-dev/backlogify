import type { GameSearchResult } from "@backlogify/types";
import { GameCover } from "./GameCover";

export function GameCard({ game }: { game: GameSearchResult }) {
	return (
		<div className="flex w-40 flex-col overflow-hidden rounded-lg transition hover:scale-[1.02] hover:shadow-lg">
			<GameCover
				name={game.name}
				coverUrl={game.coverUrl}
				className="h-52 w-full"
			/>
			<div className="flex h-14 items-center justify-center bg-card p-2">
				<h3 className="line-clamp-2 text-center text-sm font-medium">
					{game.name}
				</h3>
			</div>
		</div>
	);
}
