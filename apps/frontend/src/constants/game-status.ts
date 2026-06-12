import type { GameStatus } from "@backlogify/types";

export const STATUS_OPTIONS: { value: GameStatus; label: string }[] = [
	{ value: "backlog", label: "Backlog" },
	{ value: "playing", label: "Playing" },
	{ value: "played", label: "Played" },
	{ value: "abandoned", label: "Abandoned" },
];

/* Tailwind classes for the status dot, backed by the --status-* vars in styles.css */
export const STATUS_DOT_CLASSES: Record<GameStatus, string> = {
	backlog: "bg-status-backlog",
	playing: "bg-status-playing",
	played: "bg-status-played",
	abandoned: "bg-status-abandoned",
};
