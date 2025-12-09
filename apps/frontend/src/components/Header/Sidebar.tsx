import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut } from "@clerk/tanstack-react-start";
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
			className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-background border-r border-border shadow-2xl transition-transform duration-300 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="flex items-center justify-between border-b border-border p-4">
				<h2 className="font-bold text-xl">Backlogify</h2>
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
				<SignedIn>
					<NavLink
						to="/my-games"
						icon={Library}
						label="My Games"
						onClick={onClose}
					/>
				</SignedIn>
				<SignedOut>
					<NavLink
						to="/sign-in"
						search={{ redirect: "/my-games" }}
						icon={LogIn}
						label="Sign In"
						onClick={onClose}
					/>
				</SignedOut>
			</nav>
		</aside>
	);
}
