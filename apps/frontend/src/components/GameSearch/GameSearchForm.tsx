import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 300;

interface GameSearchFormProps {
	defaultValue?: string;
	onSearch: (query: string) => void;
}

export function GameSearchForm({
	defaultValue = "",
	onSearch,
}: GameSearchFormProps) {
	const [searchTerm, setSearchTerm] = useState(defaultValue);
	const inputRef = useRef<HTMLInputElement>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	// Clearing the pending debounce timer on unmount is genuine external
	// resource cleanup, the one case where an Effect is the right tool.
	useEffect(() => () => clearTimeout(timerRef.current), []);

	function handleChange(value: string) {
		setSearchTerm(value);
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => {
			onSearch(value.trim());
		}, DEBOUNCE_MS);
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		clearTimeout(timerRef.current);
		onSearch(searchTerm.trim());
	}

	function handleClear() {
		setSearchTerm("");
		clearTimeout(timerRef.current);
		onSearch("");
		inputRef.current?.focus();
	}

	return (
		<form onSubmit={handleSubmit} role="search" className="relative max-w-xl">
			<Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				ref={inputRef}
				type="text"
				value={searchTerm}
				onChange={(e) => handleChange(e.target.value)}
				className="h-12 rounded-xl pr-10 pl-11 text-base"
				placeholder="Search for a game..."
				autoFocus
			/>
			{searchTerm && (
				<button
					type="button"
					onClick={handleClear}
					aria-label="Clear search"
					className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
				>
					<X className="size-4" />
				</button>
			)}
		</form>
	);
}
