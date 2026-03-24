# Docker setup (NestJS + Prisma + Postgres)

This repo includes:

- `Dockerfile`: builds a production image for the NestJS API and Prisma client
- `docker-compose.yml`: runs Postgres + the API together

The API container runs `prisma migrate deploy` on startup, then starts the server.

## Prerequisites

- Docker Desktop installed
- (Optional) `psql` locally if you want to connect to the DB from your machine

## Quick start (recommended)

From the project root:

```bash
docker compose up --build
```

After it starts:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Postgres: `localhost:5432` (user `postgres`, password `postgres`, db `fliq_water`)

To stop:

```bash
docker compose down
```

To stop and delete the database data too:

```bash
docker compose down -v
```

## Environment variables / secrets

The compose file currently defines defaults for:

- `DATABASE_URL`
- `OWNER_SECRET`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`

For real deployments, do **not** keep secrets in `docker-compose.yml`. Use one of these approaches:

### Option A: Use an env file (local)

1) Create a file like `.env.docker` (don’t commit it):

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgresql://postgres:postgres@db:5432/fliq_water?schema=public
OWNER_SECRET=change-me
JWT_ACCESS_SECRET=change-me
JWT_REFRESH_SECRET=change-me
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

2) Update `docker-compose.yml` to use it, for example:

```yaml
services:
  api:
    env_file:
      - .env.docker
```

### Option B: Pass env vars at runtime

```bash
OWNER_SECRET=... JWT_ACCESS_SECRET=... JWT_REFRESH_SECRET=... docker compose up --build
```

## Prisma + database operations

### Run migrations (already runs automatically on API start)

The API container runs:

```bash
npx prisma migrate deploy
```

If you want to run it manually:

```bash
docker compose exec api npx prisma migrate deploy
```

### Generate Prisma client (usually not needed manually)

```bash
docker compose exec api npx prisma generate
```

### Open Prisma Studio

Prisma Studio needs a port exposed. The quickest way is to run it on your host:

```bash
npx prisma studio
```

If you want it inside docker, you can add a port mapping and run:

```bash
docker compose exec api npx prisma studio --hostname 0.0.0.0 --port 5555
```

Then expose `5555:5555` in `docker-compose.yml` for the `api` service.

### Reset the database (destructive)

This drops data and recreates schema.

```bash
docker compose down -v
docker compose up --build
```

## Useful commands

- View logs:

```bash
docker compose logs -f api
docker compose logs -f db
```

- Shell into the API container:

```bash
docker compose exec api sh
```

- Rebuild API image:

```bash
docker compose build api --no-cache
```

