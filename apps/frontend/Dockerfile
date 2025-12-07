# ---- builder ----
FROM node:20-slim AS builder
WORKDIR /app

# Copy entire repo first
COPY . .

# Fresh install for Linux platform
RUN rm -f package-lock.json
RUN npm install
RUN npm install lightningcss-linux-x64-gnu@1.30.2 --save-optional

# Build: pass any build args you need (Clerk key, etc)
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Debug: check what's actually there
RUN echo "DEBUG: vite config content:" && cat /app/apps/frontend/vite.config.ts

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
