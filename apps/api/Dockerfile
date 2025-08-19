# syntax=docker/dockerfile:1
FROM node:20-alpine as base
WORKDIR /app

# Install dependencies only for API
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/providers/package.json packages/providers/
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
RUN pnpm install --filter @ai-career/api... --frozen-lockfile

# Build API
COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
COPY packages/providers ./packages/providers
RUN pnpm --filter @ai-career/api build

FROM node:20-alpine as runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/apps/api/dist ./dist
COPY --from=base /app/apps/api/node_modules ./node_modules
CMD ["node", "dist/main.js"]