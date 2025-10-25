import { useState } from "react";

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
			<input
				type="text"
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="w-full max-w-md rounded-lg border border-gray-300 bg-white p-2 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
				placeholder="Search for a game..."
			/>
			<button
				type="submit"
				className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow hover:bg-blue-700 active:scale-[0.98]"
			>
				Search
			</button>
		</form>
	);
}
