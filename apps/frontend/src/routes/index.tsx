import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Library, Search } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

// Decorative cover art gradients — evoke game box art at a glance
const coverGradients = [
	"linear-gradient(160deg, #0f0c29, #302b63, #24243e)",
	"linear-gradient(160deg, #1a0533, #833ab4, #4a0080)",
	"linear-gradient(160deg, #0d1b2a, #1b4332, #40916c)",
	"linear-gradient(160deg, #3d0000, #c0392b, #e74c3c)",
	"linear-gradient(160deg, #0a0a2e, #1a1a6e, #4444cc)",
	"linear-gradient(160deg, #1a0a00, #b45309, #d97706)",
	"linear-gradient(160deg, #0d0d1a, #1e3a5f, #2980b9)",
	"linear-gradient(160deg, #1a0020, #6d28d9, #a78bfa)",
	"linear-gradient(160deg, #001a0a, #065f46, #10b981)",
	"linear-gradient(160deg, #1a0505, #991b1b, #f87171)",
	"linear-gradient(160deg, #0a0a0a, #374151, #6b7280)",
	"linear-gradient(160deg, #0f1923, #1e3a5f, #00b4d8)",
];

const steps = [
	{
		number: "01",
		title: "Search",
		description: "Browse 500,000+ games from the RAWG database by title.",
	},
	{
		number: "02",
		title: "Save",
		description: "Add anything to your backlog in one click. No clutter.",
	},
	{
		number: "03",
		title: "Track",
		description: "Move games through Backlog, Playing, and Played as you go.",
	},
];

function App() {
	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="relative overflow-hidden px-6 py-28 text-center">

				{/* Game cover mosaic — the visual anchor */}
				<div className="mosaic-drift pointer-events-none absolute inset-0 flex flex-wrap content-start gap-1.5 p-1.5 opacity-20">
					{coverGradients.map((gradient, i) => (
						<div
							key={i}
							className="shrink-0 rounded-sm"
							style={{
								background: gradient,
								width: "calc(8.333% - 6px)",
								aspectRatio: "2/3",
							}}
						/>
					))}
				</div>

				{/* Gradient overlays to fade the mosaic into the background */}
				<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_30%,oklch(0.10_0.025_280)_80%)]" />

				{/* Primary colour glow */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,oklch(0.68_0.28_280/0.2),transparent_70%)]" />

				<div className="relative mx-auto max-w-4xl">
					<h1 className="mb-5 font-extrabold text-7xl tracking-tight md:text-9xl">
						<span className="bg-gradient-to-br from-white via-white to-primary/60 bg-clip-text text-transparent drop-shadow-[0_0_40px_oklch(0.68_0.28_280/0.6)]">
							Backlogify
						</span>
					</h1>
					<p className="mb-10 text-muted-foreground text-xl md:text-2xl">
						The games you mean to play, finally in one place.
					</p>
					<div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Button
							size="lg"
							className="shadow-[0_0_24px_oklch(0.68_0.28_280/0.4)] transition-shadow hover:shadow-[0_0_36px_oklch(0.68_0.28_280/0.6)]"
							asChild
						>
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

			{/* Steps */}
			<section className="mx-auto max-w-4xl px-6 pb-28">
				<div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border md:grid-cols-3 md:divide-x md:divide-y-0">
					{steps.map((step) => (
						<div
							key={step.number}
							className="step-scroll group bg-card/50 p-8 transition-colors duration-200 hover:bg-card"
						>
							<span className="mb-4 block font-mono text-primary text-xs tracking-[0.2em] uppercase">
								{step.number}
							</span>
							<h3 className="mb-2 font-bold text-xl">{step.title}</h3>
							<p className="text-muted-foreground text-sm leading-relaxed">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
