import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Home, Library, Search, X } from "lucide-react";

interface MobileNavProps {
	isOpen: boolean;
	onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
	return (
		<>
			{/* Backdrop */}
			{isOpen && (
				<button
					onClick={onClose}
					type="button"
					onKeyDown={(e) => e.key === "Escape" && onClose()}
				>
					<div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" />
				</button>
			)}

			{/* Slide-in drawer */}
			<aside
				className={`fixed top-0 right-0 z-50 flex h-full w-72 transform flex-col bg-background border-l border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between border-b border-border p-4">
					<Link to="/" className="flex items-center gap-2" onClick={onClose}>
						<Gamepad2 className="size-6 text-primary" />
						<span className="font-bold text-lg">Backlogify</span>
					</Link>
					<Button
						variant="ghost"
						size="icon"
						onClick={onClose}
						aria-label="Close menu"
					>
						<X className="size-5" />
					</Button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 overflow-y-auto p-4 space-y-1">
					<MobileNavLink to="/" icon={Home} label="Home" onClick={onClose} />
					<MobileNavLink
						to="/games"
						icon={Search}
						label="Search Games"
						onClick={onClose}
					/>
					<SignedIn>
						<MobileNavLink
							to="/my-games"
							icon={Library}
							label="My Games"
							onClick={onClose}
						/>
					</SignedIn>
				</nav>

				{/* Footer - Sign in for signed out users */}
				<SignedOut>
					<div className="border-t border-border p-4">
						<SignInButton mode="modal">
							<Button className="w-full">Sign In</Button>
						</SignInButton>
					</div>
				</SignedOut>
			</aside>
		</>
	);
}

interface MobileNavLinkProps {
	to: string;
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	onClick?: () => void;
}

function MobileNavLink({ to, icon: Icon, label, onClick }: MobileNavLinkProps) {
	return (
		<Link
			to={to}
			onClick={onClick}
			className="flex items-center gap-3 rounded-lg p-3 text-foreground transition-colors hover:bg-accent"
			activeProps={{
				className:
					"flex items-center gap-3 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
			}}
		>
			<Icon className="size-5" />
			<span className="font-medium">{label}</span>
		</Link>
	);
}
