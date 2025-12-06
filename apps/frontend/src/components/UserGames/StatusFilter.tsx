import type { GameStatus } from "@backlogify/types";

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
				<button
					key={option.value}
					type="button"
					onClick={() => onChange(option.value)}
					className={`rounded-full px-4 py-2 font-medium text-sm transition ${
						value === option.value
							? "bg-blue-600 text-white"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					{option.label} ({counts[option.value]})
				</button>
			))}
		</div>
	);
}
