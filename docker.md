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

The `api` service loads **`docker/compose.env`** (tracked in the repo) so `docker compose up` works without creating extra files. It sets:

- `DATABASE_URL` (host `db`, user/password/db matching the `db` service)
- `REDIS_URL` (host `redis`)
- `OWNER_SECRET`, `JWT_*` — **dev placeholders only**; change them for anything beyond local use

For real deployments, do **not** reuse those JWT/owner values. Prefer one of these:

### Option A: Private override file

Copy `docker/compose.env` to e.g. `.env.docker` (add to `.gitignore` if needed), edit secrets, then use a `docker-compose.override.yml` that sets `env_file: [.env.docker]` for `api`, or temporarily point `env_file` in `docker-compose.yml` to your file.

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

