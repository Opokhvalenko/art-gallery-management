# Art Gallery Management — Frontend

React 19 + TypeScript SPA for browsing, filtering, creating, editing and deleting artworks against the backend API.

## Setup

```bash
npm install
cp .env.example .env   # VITE_API_URL — defaults to http://localhost:3000
npm run dev
```

The app boots on `http://localhost:5173`. The backend must be running (see `../backend/README.md`) — this app has no local-storage fallback; it talks to the real API.

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
| **React 19 + Vite + TypeScript strict** | Strongest part of the author's stack (AdTell, Heartland Homes production experience). |
| **TanStack Query** | The 4 required states (loading/error/empty/success) come from `isPending`/`isError`/`data` out of the box, plus cache invalidation and optimistic updates for delete — without hand-rolled state machines. |
| **React Hook Form + Zod** | One form component, two modes (create/edit); the Zod schema mirrors the backend DTO's validation rules exactly, so invalid input never reaches the API. |
| **Tailwind CSS v4** | Zero-config via the Vite plugin — one `@import`, no `tailwind.config.js`. |
| **sonner** | Lightweight toast notifications for mutation success/error feedback. |
| **Headless UI** | Unstyled, accessible `Dialog` for the modal (add/edit form, delete confirmation) — focus trap, Escape-to-close, scroll lock, and an enter/exit transition, all from the library instead of a hand-rolled implementation. All visual styling is still Tailwind. |
| **Vitest + Testing Library** | 16 tests across the critical paths — form validation, filters, all 4 list states, delete confirm flow, the artwork image hash (including a regression test for an id-collision bug found during review). Hooks are mocked rather than hitting a real `QueryClient`/network, keeping each test isolated to one component's behavior. |
| **No Redux** | Nothing here needs global client state beyond what TanStack Query's cache already provides — adding Redux would be unjustified complexity for this scope. |

## Features

- **List + filters**: artist (debounced 350ms), type (predefined list), price sort (asc/desc), combinable
- **4 data states**: skeleton grid while loading, error state with retry, empty state, success grid
- **Create / edit**: one shared form (`ArtworkForm`), RHF + Zod validation, backend field errors (`ApiError.details`) mapped onto form fields as a second line of defense
- **Delete**: confirm dialog, optimistic removal from every active query variant with rollback on failure
- **Responsive**: mobile-first grid and header, verified via code review against Tailwind's deterministic breakpoints (see root README's "What I'd add next" for the one tooling gap encountered here)
- **Artwork imagery**: the model has no image field, so each card shows a full, uncropped (`object-contain`) public-domain image for its type — see the root README's decisions table for the full list and attribution

## Tests

16 tests in 5 files (`npm run test`):
- `ArtworkFilters.test.tsx` — controlled inputs, Clear filters visibility and reset
- `ArtworkList.test.tsx` — all 4 data states
- `ArtworkForm.test.tsx` — Zod validation blocks submit, edit mode pre-fills, submit sends the correct payload
- `ArtworkCard.test.tsx` — delete confirm dialog (cancel is a no-op, confirm calls the mutation)
- `artwork-placeholder.test.ts` — the per-type image hash is deterministic and actually splits artworks of the same type across different images (a regression test for a real collision found in review — see below)

## What I'd add next

- Playwright e2e covering the full create → filter → edit → delete loop against a real backend — RTL component tests were judged sufficient for this scope.
- A proper design system / component library once the UI surface grows past a handful of screens.
- Virtualized list rendering — irrelevant at the current record counts, would reconsider past a few hundred artworks.
