import { cn } from "@/lib/utils";

interface SwitchProps {
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
	disabled?: boolean;
	id?: string;
	"aria-label"?: string;
}

/**
 * Minimal accessible toggle. Built on a plain button rather than pulling in
 * @radix-ui/react-switch to keep the dependency surface small.
 */
function Switch({
	checked,
	onCheckedChange,
	disabled,
	id,
	...props
}: SwitchProps) {
	return (
		<button
			type="button"
			role="switch"
			id={id}
			aria-checked={checked}
			disabled={disabled}
			onClick={() => onCheckedChange(!checked)}
			className={cn(
				"focus-visible:ring-ring/50 inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent outline-none transition-colors focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
				checked ? "bg-primary" : "bg-input dark:bg-input/50",
			)}
			{...props}
		>
			<span
				className={cn(
					"bg-background pointer-events-none block size-4 rounded-full shadow-sm transition-transform",
					checked ? "translate-x-4" : "translate-x-0.5",
				)}
			/>
		</button>
	);
}

export { Switch };
