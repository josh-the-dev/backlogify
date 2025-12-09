import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Gamepad2, Library, ListChecks, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const features = [
		{
			icon: <Search className="size-12 text-cyan-400" />,
			title: "Search Games",
			description:
				"Browse thousands of games from the RAWG database. Find your next adventure with ease.",
		},
		{
			icon: <Library className="size-12 text-cyan-400" />,
			title: "Build Your Backlog",
			description:
				"Add games to your personal backlog. Never forget about that game you wanted to play.",
		},
		{
			icon: <ListChecks className="size-12 text-cyan-400" />,
			title: "Track Progress",
			description:
				"Mark games as backlog, playing, or played. See your gaming journey at a glance.",
		},
	];

	return (
		<div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
			<section className="relative overflow-hidden px-6 py-20 text-center">
				<div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
				<div className="relative mx-auto max-w-5xl">
					<div className="mb-6 flex items-center justify-center gap-4">
						<Gamepad2 className="size-16 text-cyan-400 md:size-20" />
						<h1 className="font-black text-5xl text-white md:text-7xl">
							<span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
								Backlogify
							</span>
						</h1>
					</div>
					<p className="mb-4 font-light text-2xl text-gray-300 md:text-3xl">
						Your personal game backlog tracker
					</p>
					<p className="mx-auto mb-8 max-w-2xl text-gray-400 text-lg">
						Stop losing track of games you want to play. Search, save, and
						organise your gaming backlog in one place.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Button size="lg" className="bg-cyan-500 hover:bg-cyan-600 shadow-lg shadow-cyan-500/50" asChild>
							<Link to="/games">
								<Search className="size-4" />
								Search Games
							</Link>
						</Button>
						<SignedIn>
							<Button size="lg" variant="outline" asChild>
								<Link to="/my-games">
									<Library className="size-4" />
									My Backlog
								</Link>
							</Button>
						</SignedIn>
						<SignedOut>
							<SignInButton mode="modal" forceRedirectUrl="/my-games">
								<Button size="lg" variant="outline">
									<Library className="size-4" />
									My Backlog
								</Button>
							</SignInButton>
						</SignedOut>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-6 py-16">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{features.map((feature) => (
						<Card
							key={feature.title}
							className="border-slate-700 bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10"
						>
							<CardHeader>
								<div className="mb-2">{feature.icon}</div>
								<CardTitle className="text-white">{feature.title}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-gray-400 leading-relaxed">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
