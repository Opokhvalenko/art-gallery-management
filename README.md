# Art Gallery Management System

A small virtual gallery manager: browse, filter, sort, create, edit and delete artworks. Built for the Techstack Trainee Full-Stack JS test task — both the frontend (React SPA) and backend (NestJS API) are implemented, with the backend as the frontend's real data source (no LocalStorage fallback).

**Live demo:** [app](https://art-gallery-management-eight.vercel.app) · [API](https://art-gallery-backend-6apv.onrender.com/artworks) · [Swagger](https://art-gallery-backend-6apv.onrender.com/api/docs)

> The API runs on Render's free plan: after ~15 minutes idle the first request can take up to a minute while it wakes up, and data written to the live demo resets to the 4 seed artworks on restart (see [What I'd add next](#what-id-add-next)).

Setup is three commands per folder, no database or Docker needed — see [How to run locally](#how-to-run-locally).

![Artwork list with filters, sort, and per-card Edit/Delete actions](docs/screenshots/gallery-list.jpg)

## What's implemented

### Backend (NestJS + Prisma + SQLite)

| Requirement | Status |
|---|---|
| `GET /artworks` — list, sort by price, filter by artist/type | ✅ |
| `GET /artworks/:id` | ✅ |
| `POST /artworks` with validation → 400 on invalid input | ✅ |
| `DELETE /artworks/:id` | ✅ |
| `PUT /artworks/:id` — listed as optional in the brief; full replace, same validation as POST | ✅ implemented, not skipped |
| Seed: 4 artworks on first run | ✅ |
| Unified error shape, Swagger docs, CI, deploy config | ✅ |

### Frontend (React 19 + Vite + TanStack Query)

| Requirement | Status |
|---|---|
| List view (title, artist, type, price, availability) | ✅ |
| Sort by price (asc/desc) | ✅ |
| Filter by artist + type | ✅ |
| Add form: title/artist required, type from predefined list, price > 0 (max 2 decimals), availability boolean | ✅ |
| Delete button per card | ✅ |
| Persistence across reload (via the real API, not LocalStorage) | ✅ |
| Edit — not required by the brief | ✅ implemented anyway, same form as create |

## How to run locally

**Prerequisites:** Node.js 22 LTS (the version CI uses; Node 20.19+ or 22.12+ also works — Vite's own requirement) and npm.

```bash
git clone <this-repo> && cd art-gallery-management

# backend — http://localhost:3000
cd backend
npm install
cp .env.example .env
npm run dev

# frontend — http://localhost:5173 (separate terminal)
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

No database setup needed — `backend/prisma/dev.db` is committed with the 4 seed artworks. Open `http://localhost:5173` for the app and `http://localhost:3000/api/docs` for Swagger.

### Project structure

```
art-gallery-management/
├── backend/    NestJS API — artworks module, DTOs, Prisma schema + SQLite, e2e tests
├── frontend/   React SPA — components, TanStack Query hooks, Zod schema, RTL tests
├── docs/       screenshot used in this README
└── .github/    CI: typecheck, lint, build and tests for both packages
```

Per-package details (scripts, stack rationale, test breakdown): [`backend/README.md`](backend/README.md), [`frontend/README.md`](frontend/README.md).

## Stack and why

| Layer | Choice | Why |
|---|---|---|
| Backend framework | **NestJS 11** (not Express) | First option in the brief and the framework I've used in production (Heartland Homes, ServiceDesk Pro). DI, Pipes, Filters and Swagger come built in, so validation and error handling don't need hand-rolled middleware. |
| Database | **SQLite** (not Postgres) | A reviewer can run it without installing a database — Postgres would mean Docker or a cloud instance just to review a CRUD task. SQLite is a single committed file. |
| ORM | **Prisma** (not TypeORM/Mongoose/Sequelize) | The ORM is optional in the brief, so its list is a suggestion. I've used Prisma in three projects and TypeORM in none — choosing the tool I know well kept the deadline risk low. |
| Frontend framework | **React 19 + Vite + TypeScript strict** | My strongest stack (AdTell, Heartland Homes). |
| Data layer | **TanStack Query** | The 4 required UI states (loading/error/empty/success) come from `isPending`/`isError`/`data` directly; also gives cache invalidation and optimistic updates for delete for free. |
| Forms | **React Hook Form + Zod** | One form component in two modes (create/edit); the Zod schema mirrors the backend DTO's rules exactly. |
| Styling | **Tailwind CSS v4** | Zero-config via the Vite plugin. |
| Accessible primitives | **Headless UI** | The add/edit and delete-confirm modals use its `Dialog` for focus trap, Escape and scroll lock instead of a hand-rolled version. It's unstyled, so all styling stays in Tailwind. |

## Decisions on ambiguities in the brief

The brief leaves several things open. Each choice below was made deliberately.

| # | Gap in the brief | Decision |
|---|---|---|
| 1 | The `Artwork` model has no image field, but the UI mockup shows pictures | The model wasn't extended — the brief's data contract is authoritative. The 4 seed artworks are real public-domain works (Van Gogh's *The Starry Night*, Vermeer's *Girl with a Pearl Earring*, NASA/ESA's *Pillars of Creation*, Degas' *Little Dancer of Fourteen Years* — all via Wikimedia Commons), each shown with its own image keyed by exact title, not by `type` — a type-based guess risks showing one artwork's picture on a different artwork of the same type. Any other artwork falls back to a gradient + initials, same as a known image that fails to load. |
| 2 | `id: string`, but the example URL is `/artworks/3` | `id` is a string (`cuid`); the numeric example in the brief is illustrative, not a format requirement. |
| 3 | "First 4 artworks on start" — seed or pagination? | Read as a one-time seed: 4 artworks committed via `prisma/seed.ts`, not pagination. |
| 4 | `artist` max length (50) is only stated in the backend requirements, not the frontend's | Applied on both sides — one Zod schema on the frontend mirrors the backend DTO. |
| 5 | "Predefined types" — no list given | Defined one: `painting`, `sculpture`, `photography`, `digital`, `print`, shared as one constant on both frontend and backend. The backend returns 400 on an unknown type. |
| 6 | `availability` is required on the frontend form but optional on the backend | Backend: optional, defaults to `true`. Frontend: the checkbox always sends an explicit boolean. |
| 7 | `price: number` is money | Modeled as Prisma `Decimal`, not `Float`, to avoid floating-point rounding on currency, and limited to 2 decimal places (cents) on both frontend and backend. Decimal serializes to JSON as a string by default — the service layer explicitly calls `.toNumber()` so the frontend always receives a real number, not `"4500"`. |
| 8 | Sort query format | Implemented exactly as the brief shows it — `?price=asc`, not `?sort=price&order=asc`. |
| 9 | Artist filter — exact match or partial? | Case-insensitive, partial match. Neither Prisma's `mode: 'insensitive'` nor SQLite's own `LIKE`/`LOWER()` case-fold beyond ASCII, so the filter is applied in JS (`String.prototype.toLowerCase()`, which is Unicode-aware) after the query, not pushed into SQL — verified with a real non-ASCII name (`"Émile Zola"`), not just an uppercase/lowercase ASCII check. |
| 10 | Error codes aren't specified | 400 for validation, 404 for a missing id on GET/PUT/DELETE, 500 for anything else — all through one global exception filter with a single response shape (see [API contract](#api-contract)). |
| 11 | Nothing about CORS/security | `helmet`, a CORS allowlist, and env validation at startup. Rate limiting listed under "What I'd add next" rather than added speculatively. |
| 12 | Nothing about pagination | Not implemented — at 4–50 records it would add complexity without value; noted below instead of built speculatively. |
| 13 | "Gallery admins" mentioned nowhere else, no auth requirement | Not implemented — out of scope for the brief. Noted below with where a guard would go if it were needed. |
| 14 | The UI mockup shows one global "Remove Artwork" button under the grid, but the brief's own text says "each listing has a delete button" | Followed the text, not the mockup — the mockup's single button isn't wired to a specific artwork, so it can't actually delete one. Implemented per-card Edit/Delete buttons instead. |
| 15 | `PUT` — "same validation as POST", but `availability` is optional there | `PUT` is a full replace: a partial body returns 400 (partial updates would be a `PATCH`, not added). An omitted `availability` resets to `true`, exactly as on create. |

## API contract

```http
GET    /artworks?price=asc&artist=Picasso&type=painting   → 200 Artwork[]
GET    /artworks/:id                                       → 200 Artwork | 404
POST   /artworks                                           → 201 Artwork | 400
PUT    /artworks/:id                                       → 200 Artwork | 400 | 404
DELETE /artworks/:id                                       → 204 | 404
```

Interactive docs: `/api/docs` (Swagger). Full request/response examples: [`backend/requests.http`](backend/requests.http).

**Validation:** `title` required, ≤99 chars · `artist` required, ≤50 chars · `type` one of the predefined list · `price` required, > 0, at most 2 decimal places · `availability` optional, defaults to `true`.

**Error shape** — the same for validation errors, 404s, unknown routes and unexpected failures:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [{ "field": "price", "message": "price must be a positive number" }]
  }
}
```

## Tests

- **Backend — 39 tests**: 30 e2e against an isolated SQLite database (`backend/test/artworks.e2e-spec.ts` — sorting and filters, validation edge cases such as whitespace-only input and a 99-character title, non-ASCII artist names, price precision, PUT replace semantics, 404s, Decimal→number, security headers) + 9 unit (`backend/src/artworks/artworks.service.spec.ts`).
- **Frontend — 21 tests** (Vitest + Testing Library): form validation and accessible error messages, the edit flow, filters, all 4 list states, the delete confirm dialog, the type badge, the artwork image lookup, network-error handling. See [`frontend/README.md`](frontend/README.md#tests) for the breakdown.
- **CI**: `.github/workflows/ci.yml` runs typecheck, lint, build and the full test suite for both packages on every push and PR.

## What I'd add next

- **Authentication / roles** for "gallery admins" — out of scope for the brief; `backend/src/common/` is where a `JwtAuthGuard` would live if this became a real product.
- **Pagination** — not worth the complexity at the current record counts; would reconsider past a few hundred artworks.
- **Rate limiting** (`@nestjs/throttler`) — cheap to add, skipped to stay inside scope.
- **Image upload** — the brief's `Artwork` model has no image field, so this wasn't added; the frontend placeholder is a deliberate substitute, not a gap.
- **Playwright e2e** on the frontend — RTL component tests were judged sufficient for this scope; e2e would close the gap between "components behave correctly in isolation" and "the real user flow works end-to-end."
- **A persistent disk for the deployed database** — Render's free web-service plan has an ephemeral filesystem, so a `POST`/`PUT`/`DELETE` made against the live backend reverts to the 4 seed rows on the next restart, deploy, or idle spin-down. Fine for reviewing the API's behavior; a real deployment would mount a persistent disk (or move off SQLite) to keep writes.

## AI usage

I used an AI coding assistant as a pair-programming tool, under my direction and review at every step — not generated unattended and submitted as-is. I made the architecture, the decisions in the table above, and the scope call (both parts, PUT included, tests, CI) myself, then verified each change by running the real test suites and a real browser against the running app rather than trusting that it compiled. That process caught several real bugs during the build — a locale-dependent price format, a Decimal-to-string serialization issue, an artist filter that only looked Unicode-safe, a modal missing a real focus trap — documented inline in the relevant commits. The decisions, the verification, and the responsibility for correctness are mine.
