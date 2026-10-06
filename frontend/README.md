# Art Gallery Management — Frontend

React 19 + TypeScript SPA for browsing, filtering, creating, editing and deleting artworks against the backend API.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL; falls back to http://localhost:3000 if unset
npm run dev
```

The app boots on `http://localhost:5173`. The backend must be running (see [`../backend/README.md`](../backend/README.md)) — the app talks to the real API, with no LocalStorage fallback. If the backend is unreachable, the list shows a clear error with a Retry button.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build (`dist/`) — runs `tsc -b` first |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | `tsc -b --noEmit` (app + test projects) |
| `npm run check:ci` | Biome lint + format check |
| `npm run test` | Vitest (RTL component tests) |

## Stack and why

| Choice | Why |
|---|---|
| **React 19 + Vite + TypeScript strict** | Strongest part of my stack (AdTell, Heartland Homes production experience). |
| **TanStack Query** | The 4 required states (loading/error/empty/success) come from `isPending`/`isError`/`data` out of the box, plus cache invalidation and optimistic updates for delete — without hand-rolled state machines. |
| **React Hook Form + Zod** | One form component, two modes (create/edit); the Zod schema mirrors the backend DTO's validation rules exactly, so invalid input never reaches the API. |
| **Tailwind CSS v4** | Zero-config via the Vite plugin — one `@import`, no `tailwind.config.js`. |
| **sonner** | Lightweight toast notifications for mutation success/error feedback. |
| **Headless UI** | Unstyled, accessible `Dialog` for the modal (add/edit form, delete confirmation) — focus trap, Escape-to-close, scroll lock, and an enter/exit transition, all from the library instead of a hand-rolled implementation. All visual styling is still Tailwind. |
| **Vitest + Testing Library** | Component tests for the critical paths (breakdown below). Mutation hooks are mocked, so each test checks one component's behavior without a network. |
| **No Redux** | Nothing here needs global client state beyond what TanStack Query's cache already provides — adding Redux would be unjustified complexity for this scope. |

## Features

- **List + filters**: artist (debounced 350ms), type (predefined list), price sort (asc/desc), combinable
- **4 data states**: skeleton grid while loading, error state with retry, empty state, success grid
- **Create / edit**: one shared form (`ArtworkForm`), RHF + Zod validation (custom messages, no browser-native popups), backend field errors (`ApiError.details`) mapped onto form fields as a second line of defense
- **Delete**: confirm dialog, optimistic removal from every active query variant with rollback on failure
- **Responsive**: mobile-first grid and header, checked at 375px — single-column grid, filters stack, header stays usable
- **Artwork imagery**: the model has no image field, so the 4 seed artworks show their own public-domain image (matched by exact title, uncropped `object-contain`); any other artwork gets a gradient + initials — see the root README's decisions table for attribution
- **Slow first load**: the live API sleeps on Render's free plan, so if the first load takes more than 4 seconds the skeletons get a "waking up the server" note instead of looking frozen

## Tests

28 tests in 7 files (`npm run test`):
- `ArtworkFilters.test.tsx` — controlled inputs, Clear filters visibility and reset
- `ArtworkList.test.tsx` — all 4 data states (empty state worded differently with and without active filters), plus the "waking up the server" hint after a slow first load
- `ArtworkForm.test.tsx` — Zod validation blocks submit (incl. >2 decimal places and the 1,000,000,000 cap in price), errors are linked to inputs via `aria-invalid`/`aria-describedby`, edit mode pre-fills, submit sends the correct payload
- `ArtworkCard.test.tsx` — the type badge, delete confirm dialog (cancel is a no-op, confirm calls the mutation)
- `artwork-placeholder.test.ts` — known titles resolve to their own image, and any other title falls back to the gradient
- `http-client.test.ts` — an unreachable backend becomes a readable `NETWORK_ERROR`, an aborted request still propagates as `AbortError`, and `Content-Type` is only sent with a body (so GETs don't trigger a CORS preflight)
- `format.test.ts` — prices show cents only when there are any (`$5,500`, `$19.90`), type labels are capitalized

## What I'd add next

- Playwright e2e covering the full create → filter → edit → delete loop against a real backend — RTL component tests were judged sufficient for this scope.
- A proper design system / component library once the UI surface grows past a handful of screens.
- Virtualized list rendering — irrelevant at the current record counts, would reconsider past a few hundred artworks.
