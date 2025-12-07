import { Link, createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Library, ListChecks, Search } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
	const features = [
		{
			icon: <Search className="h-12 w-12 text-cyan-400" />,
			title: "Search Games",
			description:
				"Browse thousands of games from the RAWG database. Find your next adventure with ease.",
		},
		{
			icon: <Library className="h-12 w-12 text-cyan-400" />,
			title: "Build Your Backlog",
			description:
				"Add games to your personal backlog. Never forget about that game you wanted to play.",
		},
		{
			icon: <ListChecks className="h-12 w-12 text-cyan-400" />,
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
						<Gamepad2 className="h-16 w-16 text-cyan-400 md:h-20 md:w-20" />
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
						organize your gaming backlog in one place.
					</p>
					<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
						<Link
							to="/games"
							className="rounded-lg bg-cyan-500 px-8 py-3 font-semibold text-white shadow-cyan-500/50 shadow-lg transition-colors hover:bg-cyan-600"
						>
							Search Games
						</Link>
						<Link
							to="/my-games"
							className="rounded-lg border border-slate-600 bg-slate-800 px-8 py-3 font-semibold text-white transition-colors hover:border-slate-500 hover:bg-slate-700"
						>
							My Backlog
						</Link>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-5xl px-6 py-16">
				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{features.map((feature) => (
						<div
							key={feature.title}
							className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/10 hover:shadow-lg"
						>
							<div className="mb-4">{feature.icon}</div>
							<h3 className="mb-3 font-semibold text-white text-xl">
								{feature.title}
							</h3>
							<p className="text-gray-400 leading-relaxed">
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
