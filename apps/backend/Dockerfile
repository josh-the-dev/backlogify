# Built from the repo root (see docker-compose.yml) so the workspace
# lockfile and the shared @backlogify/types package are available
FROM node:22-alpine AS builder
WORKDIR /app

COPY . .
RUN npm ci

# The backend's prebuild hook builds @backlogify/types first
RUN npm run build --workspace=backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# node_modules/@backlogify/types is a workspace symlink into packages/types,
# so the package (manifest, built output, any nested deps) must sit at the
# same path
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/types ./packages/types
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist

USER nestjs
WORKDIR /app/apps/backend

EXPOSE 3001
ENV PORT=3001

CMD ["node", "dist/main"]
