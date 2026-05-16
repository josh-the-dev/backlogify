# Backlogify

[![CI](https://github.com/josh-the-dev/backlogify/actions/workflows/ci.yml/badge.svg)](https://github.com/josh-the-dev/backlogify/actions/workflows/ci.yml)

A full-stack video game backlog tracker. Search 500k+ games via the RAWG API, add them to your personal library, and track progress across **Backlog → Playing → Played**.

## Features

- **Game Search** - Full-text search across 500,000+ games powered by the [RAWG API](https://rawg.io/apidocs)
- **Backlog Management** - Add, update, and remove games from your personal library
- **Status Tracking** - Organise games as `Backlog`, `Playing`, or `Played`
- **Game Details** - Descriptions, genres, platforms, and release dates
- **Authenticated** - Per-user data isolation via Clerk JWT; all routes protected by an internal API key
- **Paginated API** - Configurable `limit`/`offset` pagination with input validation on every endpoint
- **Rate Limited** - 100 requests per minute per client via `@nestjs/throttler`
- **Request Logging** - Structured HTTP logs (`METHOD /path status - Xms`) via a global NestJS interceptor
- **Responsive UI** - Tailwind CSS + shadcn/ui, works on desktop and mobile

## Tech Stack

### Frontend

| | |
|---|---|
| [TanStack Start](https://tanstack.com/start) | Full-stack React SSR framework |
| [TanStack Router](https://tanstack.com/router) | Type-safe file-based routing |
| [TanStack Query](https://tanstack.com/query) | Server state, caching, optimistic updates |
| [Clerk](https://clerk.com/) | Authentication & user management |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | Radix UI component library |

### Backend

| | |
|---|---|
| [NestJS](https://nestjs.com/) | Node.js framework with DI, guards, pipes, interceptors |
| [Drizzle ORM](https://orm.drizzle.team/) | Type-safe SQL query builder |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [@nestjs/throttler](https://github.com/nestjs/throttler) | Rate limiting |

### Infrastructure

| | |
|---|---|
| [Turborepo](https://turbo.build/) | Monorepo build orchestration with caching |
| [GitHub Actions](https://github.com/features/actions) | CI pipeline (lint, typecheck, unit tests, e2e, security audit) |
| [Railway](https://railway.app/) | Backend hosting with automatic deployments |
| [Docker Compose](https://docs.docker.com/compose/) | Local PostgreSQL |

## Project Structure

```
backlogify/
├── apps/
│   ├── backend/          # NestJS API (port 3001)
│   └── frontend/         # TanStack Start SSR app (port 3000)
├── packages/
│   └── types/            # Shared TypeScript interfaces (@backlogify/types)
├── .github/workflows/
│   └── ci.yml            # CI pipeline
├── docker-compose.yml
└── turbo.json
```

## Architecture

```
Browser
  → TanStack Start SSR route (/api/...)   [injects API_KEY + Clerk JWT]
  → NestJS API                            [validates API_KEY → Clerk JWT → handler]
  → Drizzle ORM → PostgreSQL
```

**Auth layers:**
- `ApiKeyGuard` - validates `x-api-key` on every route (server-to-server secret)
- `ClerkAuthGuard` - validates Clerk JWT on user-specific routes, extracts `userId`

## Getting Started

### Prerequisites

- Node.js 22+
- Docker & Docker Compose (for local database)

### Environment Variables

**`apps/backend/.env`**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backlogify
RAWG_API_KEY=your_rawg_api_key
API_KEY=your_internal_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

**`apps/frontend/.env`**
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
API_KEY=your_internal_api_key
BACKEND_URL=http://localhost:3001
```

### Installation

```bash
npm install
docker-compose up -d
npm run db:migrate -w apps/backend
npm run dev
```

Frontend: `http://localhost:3000` | Backend: `http://localhost:3001`

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/games/search?query=&limit=&offset=` | API Key | Search games |
| `GET` | `/games/:id` | API Key | Get game details |
| `GET` | `/user-games?limit=&offset=` | JWT + API Key | Get user's backlog |
| `POST` | `/user-games` | JWT + API Key | Add game to backlog |
| `PATCH` | `/user-games/:id/status` | JWT + API Key | Update game status |
| `DELETE` | `/user-games/:id` | JWT + API Key | Remove from backlog |

All endpoints are rate-limited to **100 req/min**. Pagination defaults: `limit=50`, `offset=0`, max `limit=100`.

## Testing

```bash
# Unit tests (Jest, 34 specs, fully mocked)
npm test -w apps/backend

# E2E tests (Jest + Supertest, real PostgreSQL, mocked Clerk/RAWG)
npm run test:e2e -w apps/backend

# Frontend component tests (Vitest + Testing Library)
npm test -w apps/frontend
```

The CI pipeline runs all of the above on every pull request, plus lint, typecheck, and `npm audit --audit-level=critical`.

## Scripts

```bash
npm run dev          # Start all apps in parallel (Turbo)
npm run build        # Build all apps
npm run lint         # ESLint across all workspaces
npm run format       # Prettier

# Database (run from repo root or apps/backend)
npm run db:generate -w apps/backend   # Generate migration files
npm run db:migrate -w apps/backend    # Apply migrations
npm run db:studio -w apps/backend     # Drizzle Studio UI

# Storybook
npm run storybook -w apps/frontend    # Component explorer on :6006
```

## Acknowledgements

- Game data - [RAWG Video Games Database](https://rawg.io/apidocs)
- Auth - [Clerk](https://clerk.com/)
- UI components - [shadcn/ui](https://ui.shadcn.com/)

## License

MIT
