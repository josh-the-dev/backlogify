import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface NavLinkProps {
	to: string;
	icon: LucideIcon;
	label: string;
	onClick?: () => void;
}

export function NavLink({ to, icon: Icon, label, onClick }: NavLinkProps) {
	return (
		<Link
			to={to}
			onClick={onClick}
			className="mb-2 flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-800"
			activeProps={{
				className:
					"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
			}}
		>
			<Icon size={20} />
			<span className="font-medium">{label}</span>
		</Link>
	);
}
