FROM node:20-alpine

RUN npm install -g pnpm@9

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile

WORKDIR /app/apps/example

CMD ["node", "app.js"]