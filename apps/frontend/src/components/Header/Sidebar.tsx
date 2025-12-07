import { Home, Library, Search, X } from "lucide-react";
import { NavLink } from "./NavLink";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
	return (
		<aside
			className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="flex items-center justify-between border-gray-700 border-b p-4">
				<h2 className="font-bold text-xl">Backlogify</h2>
				<button
					type="button"
					onClick={onClose}
					className="rounded-lg p-2 transition-colors hover:bg-gray-800"
					aria-label="Close menu"
				>
					<X size={24} />
				</button>
			</div>

			<nav className="flex-1 overflow-y-auto p-4">
				<NavLink to="/" icon={Home} label="Home" onClick={onClose} />
				<NavLink
					to="/games"
					icon={Search}
					label="Search Games"
					onClick={onClose}
				/>
				<NavLink
					to="/my-games"
					icon={Library}
					label="My Games"
					onClick={onClose}
				/>
			</nav>
		</aside>
	);
}
