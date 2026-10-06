# Art Gallery Management — Backend

NestJS + Prisma + SQLite API for managing artwork listings in a virtual gallery.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

The app boots on `http://localhost:3000`. No database setup needed — `prisma/dev.db` is committed with 4 seed artworks, so this is the only command required.

Swagger UI (interactive API docs): `http://localhost:3000/api/docs`

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with watch mode |
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
| **NestJS 11** | Matches the task's first-listed framework option. Built-in DI, Pipes, Filters and `@nestjs/swagger` give a documented, validated API without hand-rolling middleware. Current stable line I've used in production (Heartland Homes). |
| **SQLite** | The committed `dev.db` means there's no database to install — no Postgres, Docker or cloud DB needed to review this. |
| **Prisma 6** | Not in the brief's suggested ORM list, but the ORM itself is optional there. Chosen because I've used it in production; `Decimal` for `price`, mapped to a plain number in the service. |
| **class-validator DTOs** | NestJS's idiomatic validation layer; combined with a global `ValidationPipe` and a custom `exceptionFactory`, every 400 response includes field-level detail, not just a flat message list. |

## API

Full contract with examples: `requests.http` (open with the VS Code REST Client extension, or any HTTP-file-compatible tool) and Swagger UI at `/api/docs` (raw OpenAPI JSON: `/api/docs-json`). Error responses (400/404) are documented with the shared `ErrorResponseDto` schema and examples — see `common/dto/error-response.dto.ts`.

| Method | Path | |
|---|---|---|
| GET | `/artworks` | List, optionally `?price=asc\|desc`, `?artist=`, `?type=` (combined with AND) |
| GET | `/artworks/:id` | Single artwork, 404 if missing |
| POST | `/artworks` | Create, validated (see below) |
| PUT | `/artworks/:id` | Full replace, same validation as POST (partial body → 400, omitted `availability` → `true`), 404 if missing |
| DELETE | `/artworks/:id` | Remove, 204, 404 if missing |

**Validation:** `title` required ≤99 chars · `artist` required ≤50 chars · `type` must be one of `painting, sculpture, photography, digital, print` (not specified in the task — this list is a documented choice) · `price` required, > 0, at most 2 decimal places · `availability` optional, defaults to `true`.

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

- **32 e2e tests** (`test/artworks.e2e-spec.ts`) — the API contract above (plus checks that the OpenAPI document references the error schema for every 400/404), run against an isolated `test.db` (never touches the committed `dev.db`). The test app is built with the same `configureApp()` as `main.ts` (validation, error filter, helmet, CORS), so tests exercise the production pipeline.
- **9 unit tests** (`src/artworks/artworks.service.spec.ts`) — the Decimal→number mapping, Prisma `P2025` → 404 mapping (update/delete run as a single query, no separate existence check), and the Unicode-aware artist filter, with a mocked Prisma client.

## What I'd add next

- Pagination — not worth the complexity at 4–50 records; would reconsider past a few hundred.
- Authentication / role-based access for "gallery admins" — out of scope for the task; a `JwtAuthGuard` would live in a new `common/guards` folder.
- Rate limiting (`@nestjs/throttler`) — cheap to add, skipped to stay within scope.
- Image upload — the task's `Artwork` model has no image field, so the model wasn't extended; the frontend shows images only for the 4 seed works and a gradient for the rest.
