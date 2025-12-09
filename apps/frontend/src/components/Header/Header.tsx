import { Button } from "@/components/ui/button";
import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Library, Menu, Search } from "lucide-react";
import { useState } from "react";
import { MobileNav } from "./MobileNav";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
					{/* Logo */}
					<Link to="/" className="flex items-center gap-2">
						<Gamepad2 className="size-6 text-primary" />
						<span className="font-bold text-lg">Backlogify</span>
					</Link>

					{/* Right side - Navigation + Auth */}
					<div className="flex items-center gap-4">
						{/* Desktop Navigation */}
						<nav className="hidden items-center md:flex">
							<Button variant="ghost" asChild>
								<Link to="/games">
									<Search className="size-4" />
									Search
								</Link>
							</Button>
							<SignedIn>
								<Button variant="ghost" asChild>
									<Link to="/my-games">
										<Library className="size-4" />
										My Games
									</Link>
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
