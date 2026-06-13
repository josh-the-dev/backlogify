import type { GameSearchResult } from "@backlogify/types";
import { useSyncExternalStore } from "react";

const KEY = "backlogify:recently-viewed";
const MAX = 12;
const EVENT = "backlogify:recently-viewed-changed";

/* Stable empty reference: useSyncExternalStore loops if snapshots aren't
   referentially stable when unchanged. */
const EMPTY: GameSearchResult[] = [];

let cachedRaw: string | null = null;
let cachedValue: GameSearchResult[] = EMPTY;

function read(): GameSearchResult[] {
	if (typeof window === "undefined") return EMPTY;
	const raw = window.localStorage.getItem(KEY);
	if (raw === cachedRaw) return cachedValue;
	cachedRaw = raw;
	if (!raw) {
		cachedValue = EMPTY;
		return cachedValue;
	}
	try {
		const parsed = JSON.parse(raw);
		cachedValue = Array.isArray(parsed) ? parsed : EMPTY;
	} catch {
		cachedValue = EMPTY;
	}
	return cachedValue;
}

export function addRecentlyViewed(game: GameSearchResult) {
	if (typeof window === "undefined") return;
	const next = [game, ...read().filter((g) => g.id !== game.id)].slice(0, MAX);
	window.localStorage.setItem(KEY, JSON.stringify(next));
	// Same-tab listeners (the storage event only fires in other tabs).
	window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
	if (typeof window === "undefined") return () => {};
	window.addEventListener(EVENT, callback);
	window.addEventListener("storage", callback);
	return () => {
		window.removeEventListener(EVENT, callback);
		window.removeEventListener("storage", callback);
	};
}

export function useRecentlyViewed(): GameSearchResult[] {
	return useSyncExternalStore(subscribe, read, () => EMPTY);
}
