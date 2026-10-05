# Art Gallery Management — Backend

NestJS + Prisma + SQLite API for managing artwork listings in a virtual gallery.

## Setup

```bash
npm install
cp .env.example .env
npm run start:dev
```

The app boots on `http://localhost:3000`. No database setup needed — `prisma/dev.db` is committed with 4 seed artworks, so this is the only command required.

Swagger UI (interactive API docs): `http://localhost:3000/api/docs`

## Scripts

| Command | What it does |
|---|---|
| `npm run start:dev` | Dev server with watch mode |
| `npm run build` | Production build (`dist/`) |
| `npm run start:prod` | Run the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run check:ci` | Biome lint + format check |
| `npm run test` | Unit tests |
| `npm run test:e2e` | e2e tests (applies migrations to an isolated `test.db` first) |
| `npm run prisma:migrate` | Create/apply a new migration (dev) |
| `npm run prisma:seed` | Re-seed (no-ops if artworks already exist) |

## Stack and why

| Choice | Why |
|---|---|
| **NestJS 11** | Matches the task's first-listed framework option. Built-in DI, Pipes, Filters and `@nestjs/swagger` give a documented, validated API without hand-rolling middleware. Deliberately NOT NestJS 12 — its latest `@nestjs/common`/`@nestjs/config` builds are ESM-only and break the standard Jest + ts-jest setup; 11.x is the last fully CommonJS-compatible major. |
| **SQLite** | The committed `dev.db` means `npm install && npm run start:dev` is the entire setup — no Postgres/Docker/cloud DB required to review this. |
| **Prisma 6.x** | Not in the task's suggested ORM list (TypeORM/Mongoose/Sequelize), but ORM is marked optional there. Chosen for direct, recent production experience — and 6.x avoids the driver-adapter complexity that Prisma 7 introduces even for simple setups. |
| **class-validator DTOs** | NestJS's idiomatic validation layer; combined with a global `ValidationPipe` and a custom `exceptionFactory`, every 400 response includes field-level detail, not just a flat message list. |

## API

Full contract with examples: `requests.http` (open with the VS Code REST Client extension, or any HTTP-file-compatible tool) and Swagger UI at `/api/docs`.

| Method | Path | |
|---|---|---|
| GET | `/artworks` | List, optionally `?price=asc\|desc`, `?artist=`, `?type=` (combined with AND) |
| GET | `/artworks/:id` | Single artwork, 404 if missing |
| POST | `/artworks` | Create, validated (see below) |
| PUT | `/artworks/:id` | Partial update, same validation, 404 if missing |
| DELETE | `/artworks/:id` | Remove, 204, 404 if missing |

**Validation:** `title` required ≤99 chars · `artist` required ≤50 chars · `type` must be one of `painting, sculpture, photography, digital, print` (not specified in the task — this list is a documented choice) · `price` required, > 0 · `availability` optional, defaults to `true`.

**Error shape** (every error, from every source — validation, not-found, unmatched routes, unexpected failures):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "price", "message": "price must be a positive number" }]
  }
}
```
Codes: `VALIDATION_ERROR` (400) · `NOT_FOUND` (404) · `INTERNAL_ERROR` (500, logged server-side with its real stack trace, never leaked to the client).

## Tests

- **20 e2e tests** (`test/artworks.e2e-spec.ts`) — every case in the API contract above, run against an isolated `test.db` (never touches the committed `dev.db`).
- **7 unit tests** (`src/artworks/artworks.service.spec.ts`) — the Decimal→number mapping and the not-found branches, with a mocked Prisma client.

## What I'd add next

- Pagination — not worth the complexity at 4–50 records; would reconsider past a few hundred.
- Authentication / role-based access for "gallery admins" — out of scope for the task, but `common/filters` and a `common/guards` folder would be the natural place for a `JwtAuthGuard`.
- Rate limiting (`@nestjs/throttler`) — cheap to add, skipped to stay within scope.
- Image upload — the task's `Artwork` model has no image field, so the frontend renders a deterministic placeholder instead of extending the contract.
