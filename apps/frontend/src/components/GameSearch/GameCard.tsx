import type { GameSearchResult } from "@backlogify/types";
import { Show } from "@clerk/tanstack-react-start";
import { GameCover } from "./GameCover";
import { QuickAddButton } from "./QuickAddButton";

function metacriticColor(score: number) {
	if (score >= 75) return "text-status-played";
	if (score >= 50) return "text-status-backlog";
	return "text-destructive";
}

export function GameCard({ game }: { game: GameSearchResult }) {
	const year = game.releaseDate?.slice(0, 4);

	return (
		<div className="group">
			<div className="border-border/60 bg-card group-hover:border-primary/60 relative overflow-hidden rounded-lg border transition-colors duration-200">
				<GameCover
					name={game.name}
					coverUrl={game.coverUrl}
					className="aspect-[3/4] w-full transition-transform duration-300 group-hover:scale-[1.04]"
				/>
				{game.metacritic != null && (
					<span
						title="Metacritic score"
						className={`absolute bottom-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 font-mono text-[11px] font-semibold backdrop-blur-sm ${metacriticColor(game.metacritic)}`}
					>
						{game.metacritic}
					</span>
				)}
				<Show when="signed-in">
					<QuickAddButton game={game} />
				</Show>
			</div>
			<h3 className="mt-2 line-clamp-1 text-sm font-medium" title={game.name}>
				{game.name}
			</h3>
			{year && <p className="text-muted-foreground text-xs">{year}</p>}
		</div>
	);
}
