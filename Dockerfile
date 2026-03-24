## Multi-stage build for NestJS + Prisma
## - Builder: installs deps, generates Prisma client, builds dist/
## - Runtime: installs production deps, runs migrations, starts server

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json nest-cli.json ./
COPY src ./src
RUN npm run build


FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

## Run DB migrations then start API
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]

