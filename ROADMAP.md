# Roadmap

Working list of improvements, roughly in build order. Tick them off as they land.

## 1. Fix: library truncates at 50 games (bug, do first)

- [ ] Backend `GET /user-games` paginates (default limit 50) but the frontend never passes `limit`/`offset`, so game 51+ silently disappears from My Games
- [ ] Decide: pass `limit=100` + "load more" button, or proper infinite scroll with TanStack Query `useInfiniteQuery`
- [ ] Same theme on search: RAWG returns one page (~20 results) with no way to see more. Add a "more results" affordance (RAWG supports `page` param)

**Size:** small-medium. No schema changes.

## 2. Finished date + personal note + Abandoned status

These three share one schema migration, so build together.

- [ ] Add `finishedAt` (nullable timestamp) to `user_games`; set automatically when status moves to `played`, editable after
- [ ] Add `note` (nullable text) to `user_games`; short free-text shown on the library tile/detail page
- [ ] Add `abandoned` to the status enum (the honest exit; keeps the backlog trustworthy). Pick a status color (likely muted gray/red)
- [ ] Update: shared types, backend DTOs + validation, status constants, filter tabs, selects
- [ ] Drizzle migration (`db:generate` + `db:migrate`), e2e test updates

**Size:** medium. One migration, touches most status UI.

## 3. "What do I play next?" (the differentiator)

- [ ] A pinned "Up next" slot at the top of My Games, or full drag-to-reorder priority within the Backlog tab
- [ ] Needs a `position`/`pinnedAt` column on `user_games` (could ride along with the #2 migration if built soon after)
- [ ] Surfacing: "Up next" card bigger than the rest of the grid

**Size:** medium-large if drag-reorder; small if just a pin.

## 4. Stats strip on My Games

Cheap once #2 exists (needs `finishedAt`).

- [ ] Completion rate (played / total)
- [ ] Finished this year count
- [ ] Oldest backlog entry ("you added this 14 months ago" - very on-brand voice)

**Size:** small. Frontend-only aggregation over data already fetched.

## 5. Richer game pages (no schema changes)

- [ ] Screenshot row (RAWG `/games/{id}/screenshots`)
- [ ] "More like this" shelf (RAWG suggested/similar games)
- [ ] Store links (RAWG `/games/{id}/stores`)
- [ ] Per-route page titles (game name in the browser tab; tab currently always shows the site tagline)

**Size:** medium. New backend endpoints + frontend sections.

## 6. Public shareable backlog

- [ ] Read-only `/u/:username` page showing someone's library
- [ ] Needs: public/private toggle per user, username slug, unauthenticated backend route
- [ ] The only social feature worth doing before going full Backloggd; it's how the app spreads

**Size:** large. Auth model changes, new public surface.

## Security / maintenance

- [ ] Upgrade `@clerk/tanstack-react-start` 0.26.x to 1.x: fixes a high-severity authorization bypass advisory (GHSA-w24r-5266-9c3c) but is a breaking major bump, needs its own PR with auth flow re-testing
- [ ] Periodically re-run `npm audit` for new criticals; CI only fails at critical level (shell-quote and vitest were bumped June 2026)

## Polish backlog (grab-bag, any time)

- [ ] `/` keyboard shortcut to focus search from anywhere
- [ ] OG meta tags / social cards for game pages
- [ ] Retry buttons on error states
- [ ] Recently viewed games shelf on the search page

## Deliberately not doing (for now)

- Reviews and star ratings: Backloggd's turf, big moderation surface, dilutes the "just track your backlog" clarity
- Friends / activity feeds
