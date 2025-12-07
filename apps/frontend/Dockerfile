# ---- builder ----
FROM node:20-slim AS builder
WORKDIR /app

# Copy package manifests first for better caching
COPY package*.json ./
# If you have a lockfile:
COPY package-lock.json ./

# Copy workspace packages' package.json files (optional optimization)
# COPY apps/frontend/package*.json apps/frontend/

# Install full dependencies (do NOT set NODE_ENV=production here)
RUN npm ci

# Copy entire repo (needed for monorepo builds/workspaces)
COPY . .

# Build: pass any build args you need (Clerk key, etc)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Make sure your vite config disables lightningcss (see checklist below)
RUN npm run build --workspace=frontend

# ---- runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user (optional, but good practice)
RUN useradd --system --uid 1001 nextjs

# Copy only the built frontend output (and any runtime deps)
COPY --from=builder /app/apps/frontend/.output ./.output
# If your server needs other files (static, .env.production), copy them here
# COPY --from=builder /app/apps/frontend/package.json ./package.json

# If the server needs node modules for production runtime, copy from builder:
# (optional) COPY --from=builder /app/node_modules ./node_modules

USER nextjs
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
