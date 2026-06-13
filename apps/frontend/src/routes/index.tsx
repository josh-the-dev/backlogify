import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Show, SignInButton } from "@clerk/tanstack-react-start";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { popularGamesQueryOptions } from "../queries/games";

export const Route = createFileRoute("/")({ component: App });

const steps = [
	{
		title: "Search",
		description:
			"Type a name, get the game. The RAWG database covers just about everything ever released.",
	},
	{
		title: "Save",
		description:
			"One click adds it to your backlog. No forms, no star ratings, no homework.",
	},
	{
		title: "Finish",
		description:
			"Move it to Playing when you start and Played when you're done. That's the whole system.",
	},
];

function CoverMarquee() {
	// The cache is shared with the search page, which can load more pages;
	// pin the marquee to page one so its length and speed stay stable
	const popularQuery = useInfiniteQuery(popularGamesQueryOptions());
	const covers = (popularQuery.data?.pages[0] ?? []).filter((g) => g.coverUrl);

	if (popularQuery.isLoading) {
		return (
			<div className="flex gap-3 overflow-hidden">
				{Array.from({ length: 10 }).map((_, i) => (
					<Skeleton
						key={`cover-skeleton-${i}`}
						className="aspect-[3/4] w-28 shrink-0 rounded-md sm:w-36"
					/>
				))}
			</div>
		);
	}

	if (covers.length === 0) return null;

	return (
		<div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
			<div className="cover-marquee flex w-max gap-3">
				{[...covers, ...covers].map((game, i) => (
					<Link
						key={`${game.id}-${i}`}
						to="/games/$id"
						params={{ id: game.id.toString() }}
						tabIndex={i >= covers.length ? -1 : undefined}
						aria-hidden={i >= covers.length || undefined}
						className="w-28 shrink-0 sm:w-36"
					>
						<img
							src={game.coverUrl ?? undefined}
							alt={game.name}
							loading="lazy"
							className="border-border/60 aspect-[3/4] w-full rounded-md border object-cover transition-opacity duration-200 hover:opacity-75"
						/>
					</Link>
				))}
			</div>
		</div>
	);
}

function App() {
	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="px-6 pb-14 pt-20 sm:pt-28">
				<div className="mx-auto max-w-6xl">
					<h1 className="font-display max-w-3xl text-5xl font-bold tracking-tight sm:text-7xl">
						Every game you swore you&apos;d get to.
					</h1>
					<p className="text-muted-foreground mt-5 max-w-xl text-lg">
						Search half a million titles, queue up the ones you mean to play,
						and keep track of what you actually finish.
					</p>
					<div className="mt-8 flex flex-wrap items-center gap-3">
						<Show when="signed-out">
							<SignInButton mode="modal" forceRedirectUrl="/my-games">
								<Button size="lg">Start your backlog</Button>
							</SignInButton>
						</Show>
						<Show when="signed-in">
							<Button size="lg" asChild>
								<Link to="/my-games">Open my library</Link>
							</Button>
						</Show>
						<Button size="lg" variant="outline" asChild>
							<Link to="/games">Browse games</Link>
						</Button>
					</div>
					<p className="text-muted-foreground mt-6 text-sm">
						Free, no ads. Game data from RAWG.
					</p>
				</div>
			</section>

			{/* What people are actually playing */}
			<section className="pb-20" aria-label="Popular games">
				<CoverMarquee />
			</section>

			{/* How it works */}
			<section className="mx-auto max-w-6xl px-6 pb-24">
				<div className="grid gap-10 sm:grid-cols-3">
					{steps.map((step) => (
						<div key={step.title} className="border-border border-t pt-5">
							<h3 className="font-display font-semibold">{step.title}</h3>
							<p className="text-muted-foreground mt-2 text-sm leading-relaxed">
								{step.description}
							</p>
						</div>
					))}
				</div>
			</section>
		</div>
	);
}
