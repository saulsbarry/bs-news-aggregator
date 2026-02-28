# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from the repo root (npm workspaces, single `web` app):

```bash
npm install          # install all deps
npm run dev          # start Next.js dev server (localhost:3000)
npm run build        # production build
npm run lint         # ESLint via Next.js
```

Database migration (run once after setting `DATABASE_URL`):

```bash
cd apps/web && node scripts/db-migrate.mjs
```

Seed sources:

```bash
psql $DATABASE_URL -f infra/db/seed-sources.sql
```

There are no automated tests in this project.

## Architecture

**Monorepo**: `apps/web` is a Next.js 14 App Router app; `infra/db` holds Postgres schema/seed.

### Data flow

```
RSS feeds → /api/cron/ingest → articles table
                                     ↓
             /api/cron/enrich → AI summarize + embed → article_embeddings
                             → cluster (cosine similarity) → clusters / cluster_articles
                             → updateHotScores → clusters.hot_score
```

Both cron routes are `POST` endpoints, triggered every 30 minutes. They are optionally secured with `Authorization: Bearer <CRON_SECRET>`.

### Key library files (`apps/web/src/lib/`)

- **`pg.ts`** — singleton `pg.Pool`; connect via `DATABASE_URL` env var (defaults to `localhost:5432/bs_news_aggregator`).
- **`ingestion/pipeline.ts`** — fetches all active RSS sources, de-duplicates by `(source_id, external_id)`, writes to `articles`.
- **`jobs/enrich.ts`** — processes articles missing embeddings: calls OpenAI for summary + topics, then stores `text-embedding-3-small` (1536-dim) vectors in `article_embeddings`.
- **`jobs/cluster.ts`** — cosine-similarity clustering (threshold 0.82, 48 h window); unclustered articles join an existing cluster or start a new one.
- **`jobs/hotScore.ts`** — scores clusters by article count (×0.4), recency decay (–0.02/hr, capped 72 h), and source `priority_score` (×0.1, max +2).
- **`ai/client.ts`** — OpenAI wrapper; both `summarize()` and `embed()` return `null` when `OPENAI_API_KEY` is unset (graceful no-op for local dev).
- **`feed.ts`** — ranked feed query: joins clusters → cluster_articles → articles → sources, supports topic/sourceId/timeRange filters, orders by `hot_score DESC`.

### Database schema highlights (`infra/db/schema.sql`)

- **`sources`** — RSS source registry with `priority_score` (used in hot-score) and `is_active` flag.
- **`articles`** — de-duped by `(source_id, external_id)` unique index; `search_vector` tsvector maintained by trigger on title/summary changes.
- **`clusters`** / **`cluster_articles`** — story groups; `cluster_articles.is_primary` marks the seed article.
- **`article_embeddings`** — pgvector table with IVFFlat index (`lists=100`, cosine).
- **`user_events`** — engagement events (article/cluster clicks); used for future ranking signals (not yet wired into hot_score).

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes (for any DB ops) | Postgres connection string |
| `OPENAI_API_KEY` | No | Enables AI summarization + embeddings |
| `CRON_SECRET` | No | Secures cron POST routes |

### API routes (`apps/web/src/app/api/`)

All routes use `runtime = "nodejs"` where DB access is needed.

- `POST /api/cron/ingest` — runs ingestion pipeline
- `POST /api/cron/enrich` — runs enrich → cluster → hotScore pipeline
- `GET /api/feed` — ranked cluster feed (`limit`, `offset`, `topic`, `sourceId`, `timeRange`)
- `GET /api/search` — full-text search on `search_vector` (`q`, `topic`, `sourceId`, `limit`)
- `GET /api/cluster/[id]` — cluster detail with articles
- `GET /api/article/[id]` — article detail
- `GET /api/sources` — active sources list
- `GET /api/health` — health check
