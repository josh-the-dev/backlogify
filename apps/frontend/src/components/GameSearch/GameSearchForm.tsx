import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GameSearchFormProps {
	defaultValue?: string;
	onSubmit: (query: string) => void;
}

export function GameSearchForm({
	defaultValue = "",
	onSubmit,
}: GameSearchFormProps) {
	const [searchTerm, setSearchTerm] = useState(defaultValue);

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const trimmed = searchTerm.trim();
		if (trimmed) onSubmit(trimmed);
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
		>
			<Input
				type="text"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="w-full max-w-md"
				placeholder="Search for a game..."
			/>
			<Button type="submit">
				<Search className="size-4" />
				Search
			</Button>
		</form>
	);
}
