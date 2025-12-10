# Backlogify - Implementation Plan

## Current Stack Overview

| Layer     | Technology                  | Version                   |
| --------- | --------------------------- | ------------------------- |
| Monorepo  | Turborepo                   | 2.0.0                     |
| Frontend  | TanStack React Start + Vite | 1.134.4 / 7.1.7           |
| Backend   | NestJS                      | 11.0.1                    |
| Database  | PostgreSQL + Drizzle ORM    | 16 / 0.38.2               |
| Auth      | Clerk                       | 0.26.5 (FE) / 1.24.0 (BE) |
| Styling   | Tailwind CSS                | 4.0.6                     |
| Linting   | Biome                       | 2.3.0                     |
| Storybook | Storybook                   | 9.1.9                     |

---

## Auth

### Switch Clerk from Dev → Production instance

- [ ] Create Clerk production instance
- [ ] Update environment variables for production
- [ ] Configure production OAuth providers
- [ ] Update CORS settings for production domains

### Secure routes (users can't access backlog, profile, review pages unless signed in)

- [x] Create auth middleware/wrapper for protected routes
- [x] Protect `/my-games` route
- [ ] Protect any profile/settings routes (when implemented)
- [x] Show Clerk modal or redirect to `/sign-in?redirect=...` for unauthenticated users
- [x] Created dedicated `/sign-in` and `/sign-up` routes

**Current State:** Complete. Frontend routes are protected with `beforeLoad` auth checks. Unauthenticated users are redirected to `/sign-in?redirect=...`. Sidebar and homepage buttons are auth-aware.

---

## Backend (NestJS)

### API key for BE (private, server-only)

- [x] RAWG API key stored in config service
- [x] Create API key guard for server-to-server routes
- [x] API key guard applied globally to all backend routes
- [x] Frontend API routes include `x-api-key` header

**Current State:** Complete. All backend routes require `x-api-key` header. Frontend server-side API routes pass the key. Browser never sees the API key (BFF pattern).

### Rate limiting for NestJS

- [ ] Install `@nestjs/throttler`
- [ ] Configure rate limits per endpoint
- [ ] Add rate limiting to RAWG API calls to prevent quota exhaustion
- [ ] Consider IP-based vs user-based throttling

**Current State:** No rate limiting implemented.

---

## Engineering Foundations

### Component System (shadcn/ui Migration)

**Current State:** Migrating custom components to shadcn/ui

**Existing custom components** (`/apps/frontend/src/components/storybook/`):

- Button, Input, Dialog, RadioGroup, Slider (to be replaced)

**shadcn/ui prerequisites (already have):**

- [x] Tailwind CSS v4 + @tailwindcss/vite
- [x] class-variance-authority (CVA)
- [x] clsx + tailwind-merge
- [x] lucide-react (shadcn's icon library)
- [x] zod (for form validation)

**Migration steps:**

- [x] Run `npx shadcn@latest init` (use `--force` for React 19 peer deps)
- [ ] Configure `components.json` with path aliases (`@/components/ui`)
- [ ] Add core components:
  ```bash
  npx shadcn@latest add button input dialog select textarea badge card slider radio-group form
  ```
- [ ] Update existing feature components to use shadcn imports
- [ ] Remove old custom components from `/components/storybook/`
- [ ] Add dark mode support via theme provider

**Design tokens (handled by shadcn):**

- [x] Colors via CSS variables (generated in globals.css)
- [x] Border radius tokens
- [x] Shadows
- [x] Dark mode built-in (just needs theme toggle)

---

### Storybook Setup

**Current State:** Complete

- [x] Storybook 9.1.9 installed and configured
- [x] CSF3 format
- [x] Tailwind integration via viteFinal hook
- [x] TanStack Router decorator in preview

**Stories exist for:**

- [x] Button (default, disabled, loading, variants)
- [x] Input
- [x] Dialog
- [x] RadioGroup
- [x] Slider
- [x] NavLink

**After shadcn migration:**

- [ ] Update stories to use shadcn components
- [ ] Add stories for new components (Select, Badge, Card, etc.)
- [ ] Add dark mode toggle in Storybook toolbar
- [ ] Optional: Clerk decorators for authenticated component testing

---

### Testing Infrastructure

#### Frontend Tests

**Current State:** Partial - infrastructure ready, minimal coverage

- [x] Vitest 3.0.5 configured (`vitest.config.ts`)
- [x] React Testing Library installed
- [x] Test setup files exist (`src/test/setup.ts`, `src/test/test-utils.tsx`)
- [ ] Only 1 test file exists (`NavLink.test.tsx`)

**Need to add tests for:**

- [ ] Component tests (Button, Input, Dialog, etc.)
- [ ] Hook tests (custom hooks)
- [ ] Utility function tests
- [ ] API client logic tests
- [ ] Query/mutation tests

#### Backend Tests

**Current State:** Complete

- [x] Jest 29.7.0 configured
- [x] Supertest for HTTP testing
- [x] E2E tests exist:
  - [x] `test/games.e2e-spec.ts`
  - [x] `test/user-games.e2e-spec.ts`
- [x] E2E config (`test/jest-e2e.json`)

---

## Full E2E Test Suite

### Frontend E2E

**Current State:** Not implemented

- [ ] Install Playwright
- [ ] Configure Playwright for the project
- [ ] Create test fixtures for auth state

**Test flows to implement:**

- [ ] Login via Clerk
- [ ] Search for a game
- [ ] Add game to backlog
- [ ] Change game status (backlog → playing → played)
- [ ] Remove game from backlog
- [ ] Profile update (when implemented)

### Backend E2E

**Current State:** Partial (basic E2E exists)

- [x] Basic E2E tests for games and user-games endpoints
- [ ] Test protected endpoints with auth
- [ ] Test rate limiting behavior (when implemented)
- [ ] Test invalid API key rejection
- [ ] Test RAWG API error handling

---

## Quality & DX (Developer Experience)

### CI/CD

**Current State:** Not implemented

- [ ] Create `.github/workflows/` directory
- [ ] Add workflow for:
  - [ ] Lint check (Biome)
  - [ ] Type-check (`turbo typecheck`)
  - [ ] Run unit tests (`turbo test`)
  - [ ] Run E2E tests on pull requests
- [ ] Configure caching for Turborepo
- [ ] Optional: Preview deployments (Vercel/Netlify)

### Linting / Formatting

**Current State:** Complete (using Biome instead of ESLint/Prettier)

- [x] Biome 2.3.0 configured (`biome.json`)
- [x] Unified linting + formatting
- [x] Tailwind class sorting enabled (`useSortedClasses`)
- [x] Scripts: `npm run lint`, `npm run format`

**Note:** Not using ESLint/Prettier - Biome handles both.

### Type Safety

**Current State:** Partial

- [x] Shared types package exists (`packages/types/`)
- [x] TypeScript path mapping configured (`@backlogify/types`)
- [x] Basic types exported (GameSearchResult, UserGame, GameStatus, etc.)
- [x] Zod installed (ready for validation schemas)

**Need to add:**

- [ ] Form validation schemas with Zod
- [ ] Request/response DTO types
- [ ] API error response types
- [ ] Type-safe API client wrapper

### Monorepo structure

**Current State:** Complete

- [x] Turborepo configured
- [x] Workspaces: `apps/backend`, `apps/frontend`, `packages/types`
- [x] Turbo tasks: build, dev, lint, test, typecheck
- [x] Shared types between FE & BE

---

## Priority Order (Suggested)

### Phase 1: Security & Stability

1. ~~Secure frontend routes (auth middleware)~~ ✅
2. ~~Add API key guard for backend~~ ✅
3. Add rate limiting to backend
4. Switch Clerk to production (before launch)

### Phase 2: Component Library (shadcn/ui)

4. Initialize shadcn/ui
5. Add core components (button, input, dialog, select, card, badge, form)
6. Migrate existing components to use shadcn

### Phase 3: Testing Foundation

7. Add frontend component tests (expand from 1 to full suite)
8. Install and configure Playwright
9. Add critical path E2E tests

### Phase 4: CI/CD

10. Set up GitHub Actions workflow
11. Add lint/typecheck/test to PR workflow

### Phase 5: Cleanup

12. Remove old/unused components

## Features to work on

- Fix re-ordering on my games area
- Skeleton loaders
- Hover over images to add to backlog (TBD) to maintain same card size

---

## Quick Reference

### Commands

```bash
# Development
npm run dev          # Start all apps
npm run build        # Build all apps
npm run lint         # Lint with Biome
npm run format       # Format with Biome
npm run test         # Run all tests
npm run typecheck    # Type check all apps

# Frontend specific
cd apps/frontend
npm run storybook    # Start Storybook on :6006
npm run test         # Run Vitest

# Backend specific
cd apps/backend
npm run test         # Run Jest unit tests
npm run test:e2e     # Run E2E tests

# shadcn/ui (run from apps/frontend)
npx shadcn@latest init
npx shadcn@latest add [component-name]
```

### Key Files

- `/turbo.json` - Turborepo config
- `/biome.json` - Linting/formatting config
- `/apps/frontend/.storybook/` - Storybook config
- `/apps/frontend/vitest.config.ts` - Vitest config
- `/apps/frontend/components.json` - shadcn/ui config (after init)
- `/apps/frontend/src/routes/sign-in.tsx` - Sign-in page
- `/apps/frontend/src/routes/sign-up.tsx` - Sign-up page
- `/apps/backend/src/auth/auth.guard.ts` - Clerk auth guard
- `/apps/backend/src/auth/api-key.guard.ts` - API key guard (global)
- `/packages/types/src/index.ts` - Shared types
