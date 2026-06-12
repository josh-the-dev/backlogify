import { Button } from "@/components/ui/button";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./MobileNav";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
					{/* Logo */}
					<Link to="/" className="font-bold font-display text-lg tracking-tight">
						Backlogify<span className="text-primary">.</span>
					</Link>

					{/* Right side - Navigation + Auth */}
					<div className="flex items-center gap-4">
						{/* Desktop Navigation */}
						<nav className="hidden items-center gap-1 md:flex">
							<Button
								variant="ghost"
								asChild
								className="text-muted-foreground data-[status=active]:bg-accent/60 data-[status=active]:text-foreground"
							>
								<Link to="/games">Search</Link>
							</Button>
							<SignedIn>
								<Button
									variant="ghost"
									asChild
									className="text-muted-foreground data-[status=active]:bg-accent/60 data-[status=active]:text-foreground"
								>
									<Link to="/my-games">My Games</Link>
								</Button>
							</SignedIn>
						</nav>

						{/* Auth */}
						<SignedOut>
							<SignInButton mode="modal">
								<Button size="sm" className="hidden md:flex">
									Sign In
								</Button>
							</SignInButton>
						</SignedOut>
						<SignedIn>
							<UserButton />
						</SignedIn>

						{/* Mobile menu button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={() => setMobileMenuOpen(true)}
							aria-label="Open menu"
						>
							<Menu className="size-5" />
						</Button>
					</div>
				</div>
			</header>

			<MobileNav
				isOpen={mobileMenuOpen}
				onClose={() => setMobileMenuOpen(false)}
			/>
		</>
	);
}
