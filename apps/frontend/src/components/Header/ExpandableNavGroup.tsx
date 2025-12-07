import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavChild {
	to: string;
	icon: LucideIcon;
	label: string;
}

export interface ExpandableNavGroupProps {
	to: string;
	icon: LucideIcon;
	label: string;
	isExpanded: boolean;
	onToggle: () => void;
	onNavigate: () => void;
	children: NavChild[];
}

export function ExpandableNavGroup({
	to,
	icon: Icon,
	label,
	isExpanded,
	onToggle,
	onNavigate,
	children,
}: ExpandableNavGroupProps) {
	return (
		<>
			<div className="flex flex-row justify-between">
				<Link
					to={to}
					onClick={onNavigate}
					className="mb-2 flex flex-1 items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
					activeProps={{
						className:
							"flex-1 flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
					}}
				>
					<Icon size={20} />
					<span className="font-medium">{label}</span>
				</Link>
				<button
					type="button"
					className="rounded-lg p-2 transition-colors hover:bg-gray-800"
					onClick={onToggle}
					aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
				>
					{isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
				</button>
			</div>
			{isExpanded && (
				<div className="ml-4 flex flex-col">
					{children.map((child) => (
						<Link
							key={child.to}
							to={child.to}
							onClick={onNavigate}
							className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
							activeProps={{
								className:
									"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
							}}
						>
							<child.icon size={20} />
							<span className="font-medium">{child.label}</span>
						</Link>
					))}
				</div>
			)}
		</>
	);
}
