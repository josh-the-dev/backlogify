import type { GameStatus, UserGame } from "@backlogify/types";
import { GameCover } from "../GameSearch/GameCover";
import { useRemoveUserGame, useUpdateUserGameStatus } from "../../queries/user-games";

const STATUS_LABELS: Record<GameStatus, string> = {
	backlog: "Backlog",
	playing: "Playing",
	played: "Played",
};

const STATUS_COLORS: Record<GameStatus, string> = {
	backlog: "bg-yellow-100 text-yellow-800",
	playing: "bg-blue-100 text-blue-800",
	played: "bg-green-100 text-green-800",
};

export function UserGameCard({ game }: { game: UserGame }) {
	const updateStatus = useUpdateUserGameStatus();
	const removeGame = useRemoveUserGame();

	const handleStatusChange = (newStatus: GameStatus) => {
		updateStatus.mutate({ gameId: game.id, status: newStatus });
	};

	const handleRemove = () => {
		if (confirm(`Remove "${game.name}" from your library?`)) {
			removeGame.mutate(game.id);
		}
	};

	const isUpdating = updateStatus.isPending || removeGame.isPending;

	return (
		<li className="flex w-64 flex-col items-center rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
			<strong className="mb-2 text-center font-medium text-gray-800 text-lg">
				{game.name}
			</strong>
			<GameCover name={game.name} coverUrl={game.coverUrl ?? null} />

			<div className="mt-3 flex w-full flex-col gap-2">
				<select
					value={game.status}
					onChange={(e) => handleStatusChange(e.target.value as GameStatus)}
					disabled={isUpdating}
					className={`w-full rounded-lg px-3 py-2 font-medium text-sm ${STATUS_COLORS[game.status]} cursor-pointer border-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50`}
				>
					{(Object.keys(STATUS_LABELS) as GameStatus[]).map((status) => (
						<option key={status} value={status}>
							{STATUS_LABELS[status]}
						</option>
					))}
				</select>

				<button
					type="button"
					onClick={handleRemove}
					disabled={isUpdating}
					className="w-full rounded-lg bg-red-50 px-3 py-2 font-medium text-red-600 text-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Remove
				</button>
			</div>
		</li>
	);
}
