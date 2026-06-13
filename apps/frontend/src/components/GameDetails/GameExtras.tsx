import type { GameSearchResult, StoreLink } from "@backlogify/types";
import {
	Dialog,
	DialogContent,
	DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	ZoomIn,
} from "lucide-react";
import { useRef, useState } from "react";
import { gameExtrasQueryOptions } from "../../queries/games";
import { GameCard } from "../GameSearch/GameCard";

export function GameExtras({ gameId }: { gameId: string }) {
	const { data } = useQuery(gameExtrasQueryOptions(gameId));

	if (!data) return null;

	const hasContent =
		data.screenshots.length > 0 ||
		data.stores.length > 0 ||
		data.similar.length > 0;
	if (!hasContent) return null;

	return (
		<div className="mt-14 space-y-12">
			<Screenshots screenshots={data.screenshots} />
			<Stores stores={data.stores} />
			<SimilarGames games={data.similar} />
		</div>
	);
}

function SectionHeading({ children }: { children: string }) {
	return (
		<h2 className="font-display mb-4 text-xl font-semibold tracking-tight">
			{children}
		</h2>
	);
}

function Screenshots({ screenshots }: { screenshots: string[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	if (screenshots.length === 0) return null;

	function scrollByViewport(direction: 1 | -1) {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
	}

	return (
		<section>
			<SectionHeading>Screenshots</SectionHeading>
			<div className="group relative">
				<div
					ref={scrollRef}
					className="scrollbar-thin -mx-6 flex snap-x scroll-px-6 gap-3 overflow-x-auto px-6 pb-2"
				>
					{screenshots.map((src, i) => (
						<button
							key={src}
							type="button"
							onClick={() => setActiveIndex(i)}
							className="group/shot relative h-40 shrink-0 cursor-pointer snap-start overflow-hidden rounded-lg border border-white/10 sm:h-52"
						>
							<img
								src={src}
								alt={`Screenshot ${i + 1}`}
								loading="lazy"
								className="h-full w-auto object-cover transition duration-300 group-hover/shot:scale-105"
							/>
							<span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover/shot:opacity-100">
								<ZoomIn className="size-6 text-white drop-shadow" />
							</span>
						</button>
					))}
				</div>
				<CarouselArrow
					direction="left"
					onClick={() => scrollByViewport(-1)}
					className="top-[calc(50%-0.5rem)] left-1 hidden opacity-0 group-hover:opacity-100 sm:flex"
				/>
				<CarouselArrow
					direction="right"
					onClick={() => scrollByViewport(1)}
					className="top-[calc(50%-0.5rem)] right-1 hidden opacity-0 group-hover:opacity-100 sm:flex"
				/>
			</div>

			<ScreenshotLightbox
				screenshots={screenshots}
				index={activeIndex}
				onIndexChange={setActiveIndex}
			/>
		</section>
	);
}

function ScreenshotLightbox({
	screenshots,
	index,
	onIndexChange,
}: {
	screenshots: string[];
	index: number | null;
	onIndexChange: (index: number | null) => void;
}) {
	const count = screenshots.length;
	const current = index ?? 0;

	const go = (direction: 1 | -1) =>
		onIndexChange((current + direction + count) % count);

	function onKeyDown(e: React.KeyboardEvent) {
		if (count < 2) return;
		if (e.key === "ArrowRight") {
			e.preventDefault();
			go(1);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			go(-1);
		}
	}

	return (
		<Dialog
			open={index !== null}
			onOpenChange={(open: boolean) => !open && onIndexChange(null)}
		>
			<DialogContent
				onKeyDown={onKeyDown}
				aria-describedby={undefined}
				className="border-0 bg-transparent p-0 shadow-none sm:max-w-5xl"
			>
				<DialogTitle className="sr-only">
					Screenshot {current + 1} of {count}
				</DialogTitle>
				<img
					src={screenshots[current]}
					alt={`Screenshot ${current + 1}`}
					className="max-h-[80vh] w-full rounded-lg object-contain"
				/>
				{count > 1 && (
					<>
						<CarouselArrow
							direction="left"
							onClick={() => go(-1)}
							className="left-2 size-11"
						/>
						<CarouselArrow
							direction="right"
							onClick={() => go(1)}
							className="right-2 size-11"
						/>
						<span className="bg-background/80 text-muted-foreground absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur">
							{current + 1} / {count}
						</span>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}

function CarouselArrow({
	direction,
	onClick,
	className,
}: {
	direction: "left" | "right";
	onClick: () => void;
	className?: string;
}) {
	const Icon = direction === "left" ? ChevronLeft : ChevronRight;

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={direction === "left" ? "Previous" : "Next"}
			className={cn(
				"border-border bg-background/80 text-foreground hover:bg-background absolute top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border shadow-md backdrop-blur transition",
				className,
			)}
		>
			<Icon className="size-4" />
		</button>
	);
}

function Stores({ stores }: { stores: StoreLink[] }) {
	if (stores.length === 0) return null;

	return (
		<section>
			<SectionHeading>Where to buy</SectionHeading>
			<div className="flex flex-wrap gap-2">
				{stores.map((store) => (
					<a
						key={store.storeId}
						href={store.url}
						target="_blank"
						rel="noopener noreferrer"
						className="border-border bg-card hover:border-primary/60 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
					>
						{store.name}
						<ExternalLink className="size-3.5 opacity-60" />
					</a>
				))}
			</div>
		</section>
	);
}

function SimilarGames({ games }: { games: GameSearchResult[] }) {
	if (games.length === 0) return null;

	return (
		<section>
			<SectionHeading>More like this</SectionHeading>
			<ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-6">
				{games.map((game) => (
					<li key={game.id}>
						<Link
							to="/games/$id"
							params={{ id: game.id.toString() }}
							className="block rounded-lg"
						>
							<GameCard game={game} />
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
