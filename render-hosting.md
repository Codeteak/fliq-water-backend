# Hosting the AquaFliq backend on Render

This guide walks you through deploying **fliq-water-backend** (NestJS + Prisma + PostgreSQL, optional Redis, Socket.IO) on [Render](https://render.com).

---

## What you need

- A Git repository pushed to **GitHub**, **GitLab**, or **Bitbucket** (Render connects to it).
- A Render account (free tier is enough to try; production workloads may need a paid plan).
- Your **production secrets** ready: strong JWT secrets, optional `OWNER_SECRET`, and frontend URLs for CORS.

---

## Architecture on Render

| Component        | Render product        | Notes |
|-----------------|------------------------|--------|
| API             | **Web Service**        | Docker or native Node (both described below). |
| Database        | **PostgreSQL**         | Your choice: **Supabase Postgres** (recommended) or Render-managed Postgres. In both cases, set `DATABASE_URL`. |
| Redis (optional)| **Key Value** (Redis)  | Improves OTP behaviour; app falls back to DB if omitted. |

The Docker image already runs **`npx prisma migrate deploy`** before `node dist/main`, so schema updates apply on each deploy.

---

## Step 1 — Configure Supabase Postgres (recommended)

1. In Supabase: open your project → **Settings** (or **Database**) → find **Connection string** / **Database URL**.
2. Copy the connection URL.
3. Set it as `DATABASE_URL` in your Render **Web Service** environment variables (Step 4).
4. If you get SSL errors, ensure the URL contains `schema=public` and `sslmode=require` (see example below).

### Prisma and SSL

Hosted Postgres (Supabase/Render) often requires TLS. If migrations or the app fail with SSL errors, append/adjust query params to `DATABASE_URL`, for example:

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public&sslmode=require
```

Use the exact URL you copied; only add/adjust `sslmode=require` if Prisma complains about SSL.

---

## Step 2 — (Optional) Create Redis

1. **New +** → **Key Value** (Redis).
2. Note the **Redis URL** (often `rediss://...` for TLS). Set it in the Web Service as **`REDIS_URL`** (see environment variables below).

If you skip Redis, OTP and related features still work using the database fallback described in the codebase.

---

## Step 3 — Create the Web Service

### Option A — Deploy with Docker (recommended for this repo)

1. **New +** → **Web Service** → connect your repository.
2. **Runtime**: **Docker**.
3. **Dockerfile path**: `Dockerfile` (repository root).
4. **Instance type**: pick according to traffic (free tier spins down when idle).
5. **Health check path**: `/api/health`  
   (The app uses global prefix `api`; health lives at `GET /api/health`.)

Render sets **`PORT`** automatically. The app uses `process.env.PORT ?? 3000`, so no change is required.

### Option B — Native Node (no Docker)

1. **New +** → **Web Service** → connect the repo.
2. **Runtime**: **Node**.
3. **Build command**:

   ```bash
   npm ci && npx prisma generate && npm run build
   ```

4. **Start command**:

   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

5. **Health check path**: `/api/health`

Ensure **Node version** is **20+** (see `package.json` `engines`). In Render, set **Environment** → **NODE_VERSION** = `20` if needed.

---

## Step 4 — Environment variables

In the Web Service → **Environment**, add at least:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Your Supabase Postgres connection string. Add `sslmode=require` (and keep `schema=public`) if Prisma/SSL complains. |
| `JWT_ACCESS_SECRET` | Yes | Long random string; signs access tokens. |
| `JWT_REFRESH_SECRET` | Yes | Long random string; signs refresh tokens. |
| `JWT_ACCESS_EXPIRES` | No | Default in code if unset (e.g. `15m`). |
| `JWT_REFRESH_EXPIRES` | No | e.g. `7d`. |
| `NODE_ENV` | Recommended | `production` |
| `CORS_ORIGINS` | **Yes for browsers** | Comma-separated frontend origins, e.g. `https://app.yourdomain.com,https://www.yourdomain.com`. If empty, only localhost defaults apply (see `main.ts`). |
| `REDIS_URL` | No | From Render Redis; e.g. `rediss://...` |
| `OWNER_SECRET` | No | If set, `POST /api/auth/register-owner` requires header `X-Owner-Secret`. |
| `PORT` | No | Render injects this; do not override unless you know you need to. |

**Security**

- Never commit real secrets; set them only in the Render dashboard (or **Environment Groups** shared across services).
- Rotate JWT secrets if they are ever leaked.

---

## Step 5 — Deploy and verify

1. Trigger a deploy (automatic on git push if **Auto-Deploy** is on).
2. Watch **Logs**: you should see migration output from `prisma migrate deploy`, then `Application is running on: http://localhost:PORT/api` (Render maps this to your public URL).
3. Open:

   - `https://<your-service>.onrender.com/api/health` — JSON health payload.
   - `https://<your-service>.onrender.com/api/docs` — Swagger UI.

4. Complete **first owner** registration (`POST /api/auth/register-owner`) if the database is empty, using your production rules for `OWNER_SECRET` if configured.

---

## WebSockets (Socket.IO) and frontends

- The server uses namespace **`/orders`** on the same host/port as the API.
- From the browser, clients typically connect to `wss://<your-render-host>/orders` (or your custom domain), passing the JWT as described in your API docs.
- Ensure **`CORS_ORIGINS`** includes every web origin that will call the API or open Socket.IO connections.

Render supports WebSockets on standard Web Services; if you see connection issues, confirm the client uses **`wss://`** in production and the correct path (`/orders`).

---

## Custom domain

1. Web Service → **Settings** → **Custom Domains** → add your domain.
2. Follow Render’s DNS instructions (CNAME or A record).
3. Add the **HTTPS** origin(s) to **`CORS_ORIGINS`**.

---

## Troubleshooting

| Symptom | What to check |
|--------|----------------|
| Build fails on `bcrypt` (native Node build) | Prefer **Docker** deploy, or ensure Render’s Node image/OS matches Prisma/bcrypt expectations. |
| `Prisma` migration errors | `DATABASE_URL` correct, DB reachable from Render, SSL params (`sslmode=require`). |
| 502 / health check fails | Health path must be **`/api/health`**; confirm service listens on **`PORT`**. |
| CORS errors from frontend | `CORS_ORIGINS` includes exact scheme + host + port (no trailing slash). |
| Cold starts / timeouts (free tier) | First request after idle can be slow; upgrade instance or enable **always on** if available on your plan. |

---

## Ongoing operations

- **Migrations**: committed under `prisma/migrations/` apply on deploy via `prisma migrate deploy`.
- **Rollback**: redeploy a previous successful commit in Render or revert in Git and push.
- **Database backups**: enable/back up according to your Supabase Postgres plan.

---

## Quick checklist

- [ ] PostgreSQL created; `DATABASE_URL` set on the Web Service  
- [ ] (Optional) Redis created; `REDIS_URL` set  
- [ ] `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` set  
- [ ] `CORS_ORIGINS` lists all production web app URLs  
- [ ] `NODE_ENV=production`  
- [ ] Health check path: **`/api/health`**  
- [ ] First deploy logs show migrations OK  
- [ ] `/api/docs` loads; test login or register-owner as needed  

---

*This guide matches the repository layout and `Dockerfile` at the time of writing. Adjust regions, plans, and secrets to your organisation’s policies.*
