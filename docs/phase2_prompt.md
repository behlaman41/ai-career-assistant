# Phase 2 — Auth, Access Control, and Secure Uploads (+ Minimal Guardrails)

You are a senior architect. Extend the Phase 1 monorepo to implement **production-grade auth**, **resource-level access control**, **secure uploads**, and **foundational guardrails**. Keep the code **modular, typed, and testable**. No business logic in controllers.

---

## Objectives

- **Auth**: Passwordless email (magic link) + Credentials (email/password) now; Google OAuth stub wired for later.
- **Access control**: Per-user tenancy with strong **ownership checks** at the repository/service layer (defense in depth).
- **Secure uploads**: Signed URLs with least privileges, content-type/size validation, optional AV scan hook.
- **Rate limiting & input validation**: Global + per-route limits; Zod guards everywhere.
- **Audit logging**: Every mutation captured with actor, resource, before/after where applicable.
- **Session & tokens**: HTTP-only cookies for web, JWT for programmatic access; short-lived access/long-lived refresh.
- **Test coverage**: Auth flows, RLS-like checks, upload path, and ownership guards.

---

## Auth (Next.js + NestJS)

### Web (Next.js / `apps/web`)

- NextAuth with:
  - `EmailProvider` (magic link, via MailHog in dev).
  - `CredentialsProvider` (email/password).
  - `GoogleProvider` (env configured, disabled behind feature flag).
- JWT strategy with secure cookies.
- Pages: `/login`, `/logout`.
- Hooks: `useSessionUser()`, `RequireAuth` wrapper.

### API (NestJS / `apps/api`)

- `AuthModule`:
  - `POST /auth/register`
  - `POST /auth/token`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- Use bcrypt (with scrypt fallback).
- JWT guards + `RolesGuard` with `@Roles()`.

---

## Access Control

- Roles: `user`, `admin`.
- Ownership scoping (`byOwner(userId)` helpers).
- `assertOwnership` in services before mutating/reading.
- Policy helpers in `/packages/shared/policy`.
- Controllers never accept `userId` from client.

---

## Secure Uploads

- `POST /uploads/init`: validate `{ mime, sizeBytes, suggestedName }`.
- MIME allow-list (`pdf, doc, docx, txt`). Max size: 10 MB.
- Generate scoped signed PUT URL.
- Worker `ingest.avscan` (stubbed, record clean/skipped/infected).
- `POST /uploads/:id/finalize`: client sends sha256; validate and persist.
- Private bucket only, no public ACL.

---

## Rate Limiting & Security

- Global: 100 req / 15m per IP.
- `/auth/*` and `/uploads/*`: 20/15m.
- Redis counters.
- CORS: only `WEB_BASE_URL`.
- Security headers (helmet).
- Request body size: 1 MB JSON default.

---

## Audit Logging

- Log: auth events, document ops, resume/jd ops, run lifecycle.
- Store actor id, resource type/id, action, timestamp, IP, diff JSON patch.

---

## Guardrails

- Fail runs if missing `parsedJson` (`ERR_MISSING_PARSE`).
- Limit tokens/characters; fail with `ERR_INPUT_TOO_LARGE`.
- Central error taxonomy in `/packages/shared/errors.ts`.

---

## Web UX

- Redirect to `/dashboard` after login.
- Upload modal validates type/size.
- Unauthorized access → `404` + AuditLog entry.
- Activity panel showing recent audit logs.

---

## DB Changes

- `User.role` enum(`user`,`admin`).
- `RefreshToken` table (allowlist).
- Extend `Document`: `sizeBytes`, `meta JSONB`.

---

## Tests

- Unit: `AuthService`, ownership guard, upload service.
- E2E: register → login → upload flow → run creation.
- Cross-tenant access fails.
- Rate limit triggers 429.
- Web: auth redirect + upload form validations.

---

## Env

```
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d
JWT_SECRET=...
NEXTAUTH_SECRET=...
EMAIL_SERVER_HOST=mailhog
EMAIL_SERVER_PORT=1025
EMAIL_FROM=noreply@local.test
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
WEB_BASE_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## Acceptance Criteria

1. Users can register/login and access dashboard; unauthorized redirected.
2. API rejects unauthenticated/foreign resource access (404 + AuditLog).
3. Upload flow enforces MIME+size, sha256 check, optional AV scan.
4. Rate limiting + security headers active.
5. AuditLogs written for all mutations.
6. Workers enforce guardrails (`ERR_MISSING_PARSE`, `ERR_INPUT_TOO_LARGE`).
7. Test coverage ≥ 80%, CI green.

---

## Deliverables

- Updated code across all packages.
- README updated with auth + MailHog setup.
- Security checklist included.

---

**Output:** Implement all items, show the updated file tree (collapsed where obvious), and print exact commands to run the stack, create a test user, and run tests.
