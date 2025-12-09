import type { GameStatus } from "@backlogify/types";
import { Button } from "@/components/ui/button";

type FilterOption = GameStatus | "all";

interface StatusFilterProps {
	value: FilterOption;
	onChange: (value: FilterOption) => void;
	counts: Record<GameStatus | "all", number>;
}

const OPTIONS: { value: FilterOption; label: string }[] = [
	{ value: "all", label: "All" },
	{ value: "backlog", label: "Backlog" },
	{ value: "playing", label: "Playing" },
	{ value: "played", label: "Played" },
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
	return (
		<div className="flex flex-wrap justify-center gap-2">
			{OPTIONS.map((option) => (
				<Button
					key={option.value}
					variant={value === option.value ? "default" : "outline"}
					size="sm"
					onClick={() => onChange(option.value)}
					className="rounded-full"
				>
					{option.label} ({counts[option.value]})
				</Button>
			))}
		</div>
	);
}
