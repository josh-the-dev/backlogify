import { Button } from "@/components/ui/button";
import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Menu, Share2 } from "lucide-react";
import { useState } from "react";
import { ShareBacklogDialog } from "../UserGames/ShareBacklogDialog";
import { MobileNav } from "./MobileNav";

export default function Header() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);

	return (
		<>
			<header className="border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
					{/* Logo */}
					<Link
						to="/"
						className="font-display text-lg font-bold tracking-tight"
					>
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
							<Show when="signed-in">
								<Button
									variant="ghost"
									asChild
									className="text-muted-foreground data-[status=active]:bg-accent/60 data-[status=active]:text-foreground"
								>
									<Link to="/my-games">My Games</Link>
								</Button>
							</Show>
						</nav>

						{/* Auth */}
						<Show when="signed-out">
							<SignInButton mode="modal">
								<Button size="sm" className="hidden md:flex">
									Sign In
								</Button>
							</SignInButton>
						</Show>
						<Show when="signed-in">
							<UserButton>
								<UserButton.MenuItems>
									<UserButton.Action
										label="Share your backlog"
										labelIcon={<Share2 className="size-4" />}
										onClick={() => setShareOpen(true)}
									/>
								</UserButton.MenuItems>
							</UserButton>
							<ShareBacklogDialog
								open={shareOpen}
								onOpenChange={setShareOpen}
							/>
						</Show>

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
