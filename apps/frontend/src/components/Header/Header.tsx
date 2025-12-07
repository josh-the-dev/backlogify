import {
	SignedIn,
	SignedOut,
	SignInButton,
	UserButton,
} from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "./Sidebar";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<header className="flex items-center justify-between bg-gray-800 p-4 text-white shadow-lg">
				<div className="flex items-center">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="rounded-lg p-2 transition-colors hover:bg-gray-700"
						aria-label="Open menu"
					>
						<Menu size={24} />
					</button>
					<h1 className="ml-4 font-semibold text-xl">
						<Link to="/">Backlogify</Link>
					</h1>
				</div>

				<div className="flex items-center">
					<SignedOut>
						<SignInButton mode="modal">
							<button
								type="button"
								className="rounded-lg bg-blue-600 px-4 py-2 font-medium transition-colors hover:bg-blue-700"
							>
								Sign In
							</button>
						</SignInButton>
					</SignedOut>
					<SignedIn>
						<UserButton />
					</SignedIn>
				</div>
			</header>

			<Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
}
