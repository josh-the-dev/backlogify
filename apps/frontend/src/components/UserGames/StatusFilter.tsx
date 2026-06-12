import type { GameStatus } from "@backlogify/types";
import { STATUS_DOT_CLASSES } from "@/constants/game-status";
import { cn } from "@/lib/utils";

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
	{ value: "abandoned", label: "Abandoned" },
];

export function StatusFilter({ value, onChange, counts }: StatusFilterProps) {
	return (
		// On mobile the row scrolls horizontally instead of wrapping; it
		// bleeds to the screen edge so a cut-off tab hints at the swipe
		<div className="scrollbar-none -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
			<div className="border-border flex w-max min-w-full gap-1 border-b">
				{OPTIONS.map((option) => {
					const isActive = value === option.value;
					return (
						<button
							key={option.value}
							type="button"
							onClick={() => onChange(option.value)}
							aria-pressed={isActive}
							className={cn(
								"relative flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm transition-colors",
								isActive
									? "text-foreground"
									: "text-muted-foreground hover:text-foreground",
							)}
						>
							{option.value !== "all" && (
								<span
									aria-hidden
									className={cn(
										"size-2 rounded-full",
										STATUS_DOT_CLASSES[option.value],
									)}
								/>
							)}
							{option.label}
							<span className="text-muted-foreground text-xs tabular-nums">
								{counts[option.value]}
							</span>
							{isActive && (
								<span className="bg-primary absolute inset-x-3 bottom-0 h-0.5 rounded-full" />
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}
