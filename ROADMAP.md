# Roadmap

Working list of improvements, roughly in build order. Tick them off as they land.

## 1. Fix: library truncates at 50 games (bug, do first)

- [x] Backend `GET /user-games` paginates (default limit 50) but the frontend never passes `limit`/`offset`, so game 51+ silently disappears from My Games
- [x] Decided: the library queryFn pages through the backend (100 per request) until a short page, keeping the flat `UserGame[]` shape that filters/counts/optimistic updates rely on
- [x] Search and the popular shelf both take a `page` param through the stack (RAWG, backend, proxy) and render via `useInfiniteQuery` with a "Load more" button (20 per page)

**Size:** small-medium. No schema changes.

## 2. Finished date + personal note + Abandoned status

These three share one schema migration, so build together.

- [x] Add `finishedAt` (nullable timestamp) to `user_games`; stamped when status moves to `played` (cleared on any other status), editable/backdatable via the same PATCH
- [x] Add `note` (nullable text) to `user_games`; editable on the detail page, shown truncated on the library tile
- [x] Add `abandoned` to the status enum; muted brick status color
- [x] Update: shared types, backend DTOs + validation (PATCH `:gameId/status` generalized to PATCH `:gameId`), status constants, filter tabs, selects
- [x] Drizzle migration `0002_lonely_tombstone.sql` (applied automatically in CI; run `db:migrate` locally)

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
- [ ] Baseline the local dev database for `drizzle-kit migrate`: the schema was originally pushed, so `drizzle.__drizzle_migrations` is empty and `db:migrate` fails locally (migration 0002 was applied by hand on 12 Jun 2026; CI migrates fresh DBs fine)

## Polish backlog (grab-bag, any time)

- [ ] `/` keyboard shortcut to focus search from anywhere
- [ ] OG meta tags / social cards for game pages
- [ ] Retry buttons on error states
- [ ] Recently viewed games shelf on the search page

## Deliberately not doing (for now)

- Reviews and star ratings: Backloggd's turf, big moderation surface, dilutes the "just track your backlog" clarity
- Friends / activity feeds
