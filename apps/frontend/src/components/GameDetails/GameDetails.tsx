import type { GameDetails as GameDetailsType } from "@backlogify/types";
import { GameDetailsContent } from "./GameDetailsContent";

interface GameDetailsProps {
	game: GameDetailsType;
}

export function GameDetails({ game }: GameDetailsProps) {
	return (
		<div className="relative">
			{game.coverUrl && (
				<div
					aria-hidden
					className="absolute inset-x-0 top-0 -z-10 h-[26rem] overflow-hidden"
				>
					<img
						src={game.coverUrl}
						alt=""
						className="size-full object-cover object-center opacity-30"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/70 to-background" />
				</div>
			)}
			<GameDetailsContent game={game} />
		</div>
	);
}
