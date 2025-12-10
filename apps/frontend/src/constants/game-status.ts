import type { GameStatus } from "@backlogify/types";

export const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
	{ value: "backlog", label: "📋 Backlog" },
	{ value: "playing", label: "🎮 Playing" },
	{ value: "played", label: "✅ Played" },
];
