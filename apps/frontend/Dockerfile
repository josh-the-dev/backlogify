FROM node:22-slim AS builder
WORKDIR /app

COPY . .

# Install from the lockfile. It records optional native binaries for every
# platform (lightningcss, rollup, esbuild, etc.), so Linux gets the right ones.
# Re-resolving without it trips an npm 10 arborist bug ("reading 'edgesOut'").
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
