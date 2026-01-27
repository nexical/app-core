FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat postgresql-client openssl coreutils

FROM base AS deps
WORKDIR /app
RUN --mount=type=bind,target=/src \
    cd /src && \
    find . -name "package.json" -not -path '*/node_modules/*' -exec cp --parents "{}" /app/ \; && \
    cp package-lock.json /app/ || true

RUN npm install

FROM base AS builder
WORKDIR /app
COPY --from=deps /app ./
COPY . .

RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

RUN apk add --no-cache curl

COPY --from=builder --chown=node:node /app ./
RUN chmod +x ./docker/entrypoint.sh

USER node

EXPOSE 4321

ENTRYPOINT ["./docker/entrypoint.sh"]
CMD ["node", "./dist/server/entry.mjs"]
