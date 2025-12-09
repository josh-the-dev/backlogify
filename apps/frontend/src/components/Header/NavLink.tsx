import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";

export interface NavLinkProps {
	to: string;
	icon: LucideIcon;
	label: string;
	onClick?: () => void;
	search?: Record<string, string>;
}

export function NavLink({ to, icon: Icon, label, onClick, search }: NavLinkProps) {
	return (
		<Link
			to={to}
			search={search}
			onClick={onClick}
			className="mb-2 flex items-center gap-3 rounded-lg p-3 text-foreground transition-colors hover:bg-accent"
			activeProps={{
				className:
					"flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-2",
			}}
		>
			<Icon size={20} />
			<span className="font-medium">{label}</span>
		</Link>
	);
}
