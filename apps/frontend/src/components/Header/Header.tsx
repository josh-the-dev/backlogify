import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<header className="flex items-center bg-gray-800 p-4 text-white shadow-lg">
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="rounded-lg p-2 transition-colors hover:bg-gray-700"
					aria-label="Open menu"
				>
					<Menu size={24} />
				</button>
				<h1 className="ml-4 font-semibold text-xl">
					<Link to="/">
						<img
							src="/tanstack-word-logo-white.svg"
							alt="TanStack Logo"
							className="h-10"
						/>
					</Link>
				</h1>
			</header>

			<Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
