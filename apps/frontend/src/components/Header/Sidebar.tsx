import { Button } from "@/components/ui/button";
import { Show } from "@clerk/tanstack-react-start";
import { Home, Library, LogIn, Search, X } from "lucide-react";
import { NavLink } from "./NavLink";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

/**
 * @deprecated Use MobileNav instead
 */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
	return (
		<aside
			className={`bg-background border-border fixed left-0 top-0 z-50 flex h-full w-80 transform flex-col border-r shadow-2xl transition-transform duration-300 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="border-border flex items-center justify-between border-b p-4">
				<h2 className="text-xl font-bold">Backlogify</h2>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					aria-label="Close menu"
				>
					<X size={24} />
				</Button>
			</div>

			<nav className="flex-1 overflow-y-auto p-4">
				<NavLink to="/" icon={Home} label="Home" onClick={onClose} />
				<NavLink
					to="/games"
					icon={Search}
					label="Search Games"
					onClick={onClose}
				/>
				<Show when="signed-in">
					<NavLink
						to="/my-games"
						icon={Library}
						label="My Games"
						onClick={onClose}
					/>
				</Show>
				<Show when="signed-out">
					<NavLink
						to="/sign-in"
						search={{ redirect: "/my-games" }}
						icon={LogIn}
						label="Sign In"
						onClick={onClose}
					/>
				</Show>
			</nav>
		</aside>
	);
}
