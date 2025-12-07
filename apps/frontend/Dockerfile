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

# Build
RUN npm run build --workspace=frontend

# ---- runner ----
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN useradd --system --uid 1001 appuser

# Copy built output
COPY --from=builder /app/apps/frontend/dist ./dist

USER appuser
EXPOSE 3000

CMD ["node", "dist/server/server.js"]
