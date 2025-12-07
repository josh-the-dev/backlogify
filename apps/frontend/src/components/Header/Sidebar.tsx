import {
	BookOpen,
	Home,
	Library,
	Network,
	Search,
	SquareFunction,
	StickyNote,
	X,
} from "lucide-react";
import { useState } from "react";
import { ExpandableNavGroup } from "./ExpandableNavGroup";
import { NavLink } from "./NavLink";

interface SidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
	const [groupedExpanded, setGroupedExpanded] = useState<
		Record<string, boolean>
	>({});

	const toggleGroup = (key: string) => {
		setGroupedExpanded((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	return (
		<aside
			className={`fixed top-0 left-0 z-50 flex h-full w-80 transform flex-col bg-gray-900 text-white shadow-2xl transition-transform duration-300 ease-in-out ${
				isOpen ? "translate-x-0" : "-translate-x-full"
			}`}
		>
			<div className="flex items-center justify-between border-gray-700 border-b p-4">
				<h2 className="font-bold text-xl">Navigation</h2>
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
				{/* Main App Links */}
				<NavLink to="/" icon={Home} label="Home" onClick={onClose} />
				<NavLink
					to="/test-games"
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

				<div className="my-4 border-gray-700 border-t" />

				{/* Demo Links */}
				<NavLink
					to="/demo/start/server-funcs"
					icon={SquareFunction}
					label="Start - Server Functions"
					onClick={onClose}
				/>
				<NavLink
					to="/demo/start/api-request"
					icon={Network}
					label="Start - API Request"
					onClick={onClose}
				/>

				<ExpandableNavGroup
					to="/demo/start/ssr"
					icon={StickyNote}
					label="Start - SSR Demos"
					isExpanded={groupedExpanded.StartSSRDemo ?? false}
					onToggle={() => toggleGroup("StartSSRDemo")}
					onNavigate={onClose}
					children={[
						{ to: "/demo/start/ssr/spa-mode", icon: StickyNote, label: "SPA Mode" },
						{ to: "/demo/start/ssr/full-ssr", icon: StickyNote, label: "Full SSR" },
						{ to: "/demo/start/ssr/data-only", icon: StickyNote, label: "Data Only" },
					]}
				/>

				<NavLink
					to="/demo/tanstack-query"
					icon={Network}
					label="TanStack Query"
					onClick={onClose}
				/>
				<NavLink
					to="/demo/storybook"
					icon={BookOpen}
					label="Storybook"
					onClick={onClose}
				/>
			</nav>
		</aside>
	);
}
