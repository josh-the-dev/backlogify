FROM node:22-slim AS builder
WORKDIR /app

COPY . .

# Delete the lockfile so npm resolves platform-specific binaries for Linux
# (the lockfile is generated on Windows/Mac and records wrong platform binaries
# for packages like lightningcss, rollup, esbuild, etc.)
# The full monorepo context ensures version resolution remains consistent.
RUN npm ci

ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN npm run build --workspace=frontend

# --- Runner ---
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Nitro bundles everything into .output
COPY --from=builder /app/apps/frontend/.output ./.output

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
