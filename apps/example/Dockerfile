FROM node:22-alpine AS env-amd64
FROM node:22-alpine AS env-arm64
FROM node:18-alpine AS env-arm

FROM env-$TARGETARCH AS base

ARG TARGETARCH

FROM base AS runtime

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

CMD ["node", "app.js"]
