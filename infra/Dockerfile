FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV DATABASE_URL=file:./packages/db/local.db

RUN apt-get update \
  && apt-get install --no-install-recommends -y sqlite3 \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@10 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db/package.json packages/db/package.json
COPY mihon/package.json mihon/package.json

RUN pnpm install --frozen-lockfile --filter readbagabondo...

COPY . .

RUN pnpm db:migrate \
  && sqlite3 packages/db/local.db < packages/db/seeds/0000_seed_vagabond_metadata.sql \
  && pnpm build

FROM caddy:2-alpine AS runtime

COPY infra/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv

RUN caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile

EXPOSE 80 443 443/udp
