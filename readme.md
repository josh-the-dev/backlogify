# Backlogify

[![Tests](https://github.com/josh-the-dev/backlogify/actions/workflows/test.yml/badge.svg)](https://github.com/josh-the-dev/backlogify/actions/workflows/test.yml)

A modern web application for managing your video game backlog. Search millions of games, track what you're playing, and never lose sight of what's next.

## Features

- **Search Games** - Browse and search over 500,000 games powered by the [RAWG Video Games Database](https://rawg.io/apidocs)
- **Track Your Backlog** - Add games to your personal library and organize them by status
- **Status Management** - Mark games as `Backlog`, `Playing`, or `Played`
- **Game Details** - View comprehensive game information including descriptions, genres, platforms, and release dates
- **Responsive Design** - Fully responsive UI that works on desktop and mobile

## Tech Stack

### Frontend

- [TanStack Start](https://tanstack.com/start) - Full-stack React framework with SSR
- [React](https://react.dev/) - UI library
- [TanStack Router](https://tanstack.com/router) - Type-safe file-based routing
- [TanStack Query](https://tanstack.com/query) - Data fetching & caching
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
- [shadcn/ui](https://ui.shadcn.com/) - Component library built on Radix UI
- [Clerk](https://clerk.com/) - Authentication & user management

### Backend

- [NestJS](https://nestjs.com/) - Node.js framework
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe ORM
- [PostgreSQL](https://www.postgresql.org/) - Database

### Infrastructure

- [Turborepo](https://turbo.build/) - Monorepo build system
- [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) - Linting & formatting
- [Docker Compose](https://docs.docker.com/compose/) - Local development environment

## Project Structure

```
backlogify/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # TanStack Start app
├── packages/
│   └── types/            # Shared TypeScript types
├── docker-compose.yml
├── turbo.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 22+
- npm
- Docker & Docker Compose (for local database)

### Environment Variables

Create `.env` files in both `apps/backend` and `apps/frontend`:

**apps/backend/.env**

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/backlogify
RAWG_API_KEY=your_rawg_api_key
API_KEY=your_internal_api_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

**apps/frontend/.env**

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
API_KEY=your_internal_api_key
BACKEND_URL=http://localhost:3001
```

### Installation

```bash
# Install dependencies
npm install

# Start the database
docker-compose up -d

# Run database migrations
npm run db:migrate --workspace=backend

# Start the development servers
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:3001`.

### Available Scripts

```bash
# Development
npm run dev              # Start all apps in dev mode

# Build
npm run build            # Build all apps

# Linting & Formatting
npm run lint             # Run ESLint across all workspaces
npm run format           # Format code with Prettier

# Database (from apps/backend)
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run db:studio        # Open Drizzle Studio

# E2E Tests
npm run test:e2e         # Run Playwright tests (starts frontend automatically)

# Storybook (from apps/frontend)
npm run storybook        # Start Storybook on :6006
```

## API Endpoints

| Method | Endpoint                     | Auth          | Description         |
| ------ | ---------------------------- | ------------- | ------------------- |
| GET    | `/games/search?query=`       | API Key       | Search games        |
| GET    | `/games/:id`                 | API Key       | Get game details    |
| GET    | `/user-games`                | JWT + API Key | Get user's backlog  |
| POST   | `/user-games`                | JWT + API Key | Add game to backlog |
| PATCH  | `/user-games/:gameId/status` | JWT + API Key | Update game status  |
| DELETE | `/user-games/:gameId`        | JWT + API Key | Remove from backlog |

## Acknowledgements

- Game data provided by [RAWG Video Games Database API](https://rawg.io/apidocs)
- Authentication powered by [Clerk](https://clerk.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

## License

MIT
