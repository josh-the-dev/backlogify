import type { GameSearchResult } from "@backlogify/types";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useRecentlyViewed } from "../lib/recently-viewed";
import { gamesSearchQueryOptions } from "../queries/games";
import { GameCover } from "./GameSearch/GameCover";

const DEBOUNCE_MS = 250;
const MAX_RESULTS = 8;

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	return (
		tag === "INPUT" ||
		tag === "TEXTAREA" ||
		tag === "SELECT" ||
		target.isContentEditable
	);
}

/**
 * Spotlight-style command palette: "/" or Cmd/Ctrl+K opens a centered search
 * over the whole app. Results stream in from the RAWG search (debounced);
 * selecting one routes to its detail page. Rendered once at the app root.
 */
export function SearchCommand() {
	const navigate = useNavigate();
	const recentlyViewed = useRecentlyViewed();
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState("");
	const [debounced, setDebounced] = useState("");
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	// Global open shortcut. A document-level key subscription (with cleanup) is
	// a genuine external-system subscription, the legitimate use of an Effect.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((prev) => !prev);
				return;
			}
			if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
				if (e.defaultPrevented || isEditableTarget(e.target)) return;
				e.preventDefault();
				setOpen(true);
			}
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, []);

	// Clear the pending debounce timer on unmount (external resource cleanup).
	useEffect(() => () => clearTimeout(timerRef.current), []);

	const searchQuery = useInfiniteQuery(gamesSearchQueryOptions(debounced));
	const results = (searchQuery.data?.pages.flat() ?? []).slice(0, MAX_RESULTS);

	function handleValueChange(next: string) {
		setValue(next);
		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setDebounced(next.trim()), DEBOUNCE_MS);
	}

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) {
			setValue("");
			setDebounced("");
			clearTimeout(timerRef.current);
		}
	}

	function goToGame(id: number) {
		handleOpenChange(false);
		navigate({ to: "/games/$id", params: { id: String(id) } });
	}

	const searching = debounced.length > 0;
	const showRecent = !searching && recentlyViewed.length > 0;

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="top-[12vh] translate-y-0 overflow-hidden p-0 sm:max-w-xl"
			>
				<DialogHeader className="sr-only">
					<DialogTitle>Search games</DialogTitle>
					<DialogDescription>
						Search for a game to open its page.
					</DialogDescription>
				</DialogHeader>
				<Command shouldFilter={false}>
					<CommandInput
						value={value}
						onValueChange={handleValueChange}
						placeholder="Search for a game..."
					/>
					<CommandList>
						{searching && searchQuery.isLoading && (
							<p className="text-muted-foreground py-6 text-center text-sm">
								Searching…
							</p>
						)}
						{searching && !searchQuery.isLoading && results.length === 0 && (
							<CommandEmpty>No games found.</CommandEmpty>
						)}
						{!searching && recentlyViewed.length === 0 && (
							<p className="text-muted-foreground py-6 text-center text-sm">
								Search half a million games.
							</p>
						)}
						{showRecent && (
							<CommandGroup heading="Recently viewed">
								{recentlyViewed.map((game) => (
									<GameResult
										key={game.id}
										game={game}
										onSelect={() => goToGame(game.id)}
									/>
								))}
							</CommandGroup>
						)}
						{results.length > 0 && (
							<CommandGroup heading="Games">
								{results.map((game) => (
									<GameResult
										key={game.id}
										game={game}
										onSelect={() => goToGame(game.id)}
									/>
								))}
							</CommandGroup>
						)}
					</CommandList>
				</Command>
			</DialogContent>
		</Dialog>
	);
}

function GameResult({
	game,
	onSelect,
}: {
	game: GameSearchResult;
	onSelect: () => void;
}) {
	const year = game.releaseDate?.slice(0, 4);

	return (
		<CommandItem value={String(game.id)} onSelect={onSelect} className="gap-3">
			<GameCover
				name={game.name}
				coverUrl={game.coverUrl}
				className="h-12 w-9 shrink-0 rounded"
			/>
			<span className="truncate">{game.name}</span>
			{year && (
				<span className="text-muted-foreground ml-auto text-xs tabular-nums">
					{year}
				</span>
			)}
		</CommandItem>
	);
}
