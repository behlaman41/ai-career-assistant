# Phase 1 --- Foundation Scaffold (Monorepo, Core Services, Clean Architecture)

You are a senior architect. Generate a production‑grade **monorepo** for
an "AI Career Assistant (Resume + JD Analyzer with RAG)". Prioritize
**modularity, clean code, testability, and provider abstractions**.

---

## Goals

- Monorepo with packages: `web` (Next.js), `api` (NestJS), `workers`
  (BullMQ), `shared` (types, schema, prompts), `infra` (Docker
  Compose, migrations, scripts).
- Postgres + **pgvector** (for embeddings), Redis (queues), MinIO
  (S3‑compatible local).
- Strong **domain layer** and folders for future RAG pipeline; no
  business logic hard‑coded into controllers.
- **Provider interfaces** for LLM, Embeddings, Storage; default
  local/OSS implementations.
- First entities, migrations, and basic CRUD to validate shape (users,
  resumes, JDs, runs).
- **Observability** (structured logs + OpenTelemetry hooks),
  **linting/formatting**, **tests**, **CI**.
- Everything runs locally with `docker compose up`.

## Tech & Conventions

- Node 20+, TypeScript strict everywhere.
- Package manager: pnpm. Workspaces enabled.
- Formatting: Prettier. Linting: ESLint (typescript-eslint, import,
  security).
- Commit style: Conventional Commits. Add a root `commitlint` +
  `husky` pre‑commit (lint+typecheck+tests).
- Env management: `dotenv` + `zod`-validated config modules.

## Monorepo Structure

    /apps
      /web               # Next.js (App Router), Tailwind, shadcn/ui
      /api               # NestJS (REST), Prisma, feature modules
      /workers           # BullMQ processors, queues, consumers
    /packages
      /shared            # zod schemas, DTOs, types, prompt builders, utils
      /configs           # eslint, tsconfig, prettier shared configs
      /providers         # abstraction layer (LLM, Embeddings, Storage, Mail)
      /ui                # (optional) shared UI primitives for web
    /infra
      docker-compose.yml
      prisma/            # schema.prisma, migrations
      scripts/           # db init, seed, pgvector enable
      otel/              # collector config (optional)
    .github
      workflows/ci.yml

## Data Model (MVP)

Implement via Prisma: - `User` (id, email \[unique\], name, createdAt) -
`Document` (id, userId, type: enum\['resume','jd','export'\],
storageKey, mime, sha256, createdAt) - `Resume` (id, userId, title,
sourceDocumentId, createdAt) - `ResumeVersion` (id, resumeId, label,
documentId, parsedJson JSONB, baseVersionId? nullable, createdAt) -
`JobDescription` (id, userId, title, company, sourceDocumentId,
parsedJson JSONB, createdAt) - `Chunk` (id, documentId, kind
enum\['resume','jd'\], seq, text, tokens, embedding Vector(1536)) // use
pgvector - `Run` (id, userId, jdId, resumeVersionId, status
enum\['queued','processing','done','failed'\], startedAt, finishedAt,
costCents int?) - `RunOutput` (id, runId, type
enum\['tailored_resume','skills','qa','scorecard'\], json JSONB,
storageKey?) - `AuditLog` (id, userId, action, meta JSONB, createdAt)

Add indexes: - `Chunk(documentId, kind, seq)` -
`Chunk USING ivfflat (embedding vector_cosine_ops)` (with `lists`
param) - `Run(userId, status)` -
`Document(userId, sha256 unique per user)` to support idempotency.

## API (NestJS)

- Layers: `controller` → `service` → `repo` (+ domain entities). No
  ORM in controllers/services.
- Modules: `AuthModule`, `UsersModule`, `DocumentsModule`,
  `ResumesModule`, `JobsModule`, `RunsModule`, `HealthModule`.
- `BullModule` configured; queues: `ingest.parse`, `ingest.embed`,
  `analysis.score` (processors stubbed).
- Endpoints (stub logic OK, but types/DTOs real):
  - `POST /uploads/init` → signed URL (MinIO) + `documentId`
  - `POST /resumes` (title, documentId) → resume
  - `POST /resumes/:id/versions` (documentId \| fromRunId) → version
  - `POST /jobs` (title, company, documentId) → jd
  - `POST /runs` (jdId, resumeVersionId) → enqueues analysis job;
    return runId
  - `GET /runs/:id` → status + placeholders for outputs
  - `GET /health` → liveness/readiness
- Validation with `zod` (use `@anatine/zod-nestjs` or custom pipe).
  All DTOs live in `/packages/shared`.

## Workers (BullMQ)

- One Node process in `/apps/workers` registering processors:
  - `ingest.parse`: Given `documentId`, stream file from
    StorageProvider, extract text (stub), detect sections; write
    `parsedJson`.
  - `ingest.embed`: chunk text (200 token overlap 40), embed via
    EmbeddingProvider, upsert `Chunk`.
  - `analysis.score`: placeholder scoring (e.g., Jaccard/TF‑IDF) to
    return a naive `match_scores` JSON; persist a `RunOutput`.
- Idempotency: job key = hash(queueName + payload). Retry/backoff, DLQ
  setup.
- Structured logging (pino) with jobId, queue, attempts.

## Providers (packages/providers)

Define interfaces + default impls. Everything DI‑driven in Nest. -
`LLMProvider`: `complete(prompt, options)` (stub to echo); prepare for
OpenAI/Groq later. - `EmbeddingProvider`:
`embed(texts: string[]) -> number[][]` (default: use `bge-small` via
local service OR stub random normalized vectors; keep interface
solid). - `StorageProvider`:
`putObject/getObject/getSignedUrl/deleteObject` (default: MinIO S3
SDK). - Add a simple `ProviderRegistry` and env‑based selection.

## Config & Env

- Root `.env.example` with:
  - `DATABASE_URL=postgresql://postgres:postgres@db:5432/app`
  - `REDIS_URL=redis://redis:6379/0`
  - `S3_ENDPOINT=http://minio:9000`
  - `S3_ACCESS_KEY=...` `S3_SECRET_KEY=...` `S3_BUCKET=files`
  - `NODE_ENV=development`
- `@/api/src/config` uses zod to validate required env, exports typed
  config.

## Observability

- pino logger everywhere (api + workers), requestId middleware, jobId
  logs.
- OpenTelemetry hooks prepared (no external backend required in Phase
  1).
- Health endpoints and `/metrics` placeholder (Prometheus later).

## Web (Next.js)

- App Router, Tailwind, shadcn/ui.
- Pages:
  - `/login` (mock email login; real auth in Phase 2)
  - `/dashboard` (cards: Resumes, Jobs, Recent Runs)
  - `/uploads` (drag‑drop to S3 via signed URL; shows file → creates
    `Document`)
  - `/workspaces/:jobId` (skeleton: left JD, right selected Resume
    Version, "Analyze" button calls `POST /runs`)
- API client via fetch wrappers; react‑query (TanStack Query)
  configured.
- Form validation with Zod + React Hook Form.

## Testing

- Unit tests: services, providers, chunker. Use Vitest or Jest (pick
  one; consistent across monorepo).
- E2E (api): supertest against in‑memory or dockerized db (prefer
  Testcontainers).
- Add sample tests for: `DocumentsService`, `Chunker`,
  `StorageProvider` (mocked).

## CI

- `.github/workflows/ci.yml`:
  - pnpm install
  - typecheck, lint, test
  - build api, workers, web
- Cache pnpm store. Fail on lint or coverage \< 80% (configurable).

## Docker Compose (infra)

Services: - `db` (postgres:16) + init script to
`CREATE EXTENSION IF NOT EXISTS vector;` - `redis` - `minio` +
`minio-setup` (creates bucket) - `api` (depends on db/redis/minio) -
`workers` (depends on db/redis/minio) - `web` (depends on api) - run
`prisma migrate deploy` on api start.

## Seed & Scripts

- `pnpm dev` → compose up + wait-on + open web.
- `pnpm db:migrate`, `pnpm db:reset`, `pnpm seed`.
- Seed a demo user, one resume, one jd, and documents referencing
  MinIO dummy objects.

## Acceptance Criteria ("Done When")

1.  `pnpm i` then `docker compose up` brings up **db, redis, minio, api,
    workers, web**.
2.  Visiting `/uploads` lets me upload a file → it appears in `Document`
    table (via API), stored in MinIO.
3.  Creating a Resume and JD (basic forms) works; records visible in
    dashboard.
4.  Clicking "Analyze" in a workspace enqueues a `Run`; workers process
    `ingest.parse → ingest.embed → analysis.score`; `GET /runs/:id`
    shows status and a placeholder `RunOutput`.
5.  Prisma migrations include **pgvector**. `Chunk.embedding` is a real
    vector column with index.
6.  Code passes `pnpm lint`, `pnpm typecheck`, and tests. CI runs the
    same on push.
7.  Providers are **interfaces** with default implementations and can be
    swapped via env.

## Nice‑to‑Have (If Time Allows in Phase 1)

- RLS‑like guards in service layer: all queries scoped by `userId`.
- Basic rate limiting middleware on API.
- Minimal Swagger or Redoc page for endpoints.

## Deliverables

- Full monorepo with code as described.
- `README.md` explaining setup, commands, envs, architecture diagram
  (ASCII), and future phases placeholder.

---

**After you generate everything**, run local build commands and ensure a
green CI locally. Keep code small, clean, and well‑typed; no premature
features. Avoid dead code; include TODOs where we will plug Phase 2
(auth, parsing real impls, embeddings, editor & exports).

**Output:** create all files, show the final file tree (collapsed where
obvious), and print the exact commands to start the stack and run tests.
