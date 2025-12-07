# Portfolio Dashboard

Production-style portfolio dashboard with live CMP, P/E, and earnings data using Next.js (App Router), TypeScript, Tailwind CSS, React Query, and a typed backend that proxies all requests through a catch-all `[[...slugs]]` route powered by Elysia.

## Features
- Live CMP, P/E ratio, and latest earnings refreshed every 15s (with cleanup).
- Sector grouping with per-sector totals and gain/loss coloring.
- Server-only finance lookups (Yahoo Finance for CMP, Google Finance scraping for P/E & earnings, Yahoo fallback for stats).
- In-memory caching and simple rate limiting to protect upstreams.
- Pure utility calculations for investment, present value, gain/loss, and portfolio percentages.
- Clean separation of API routing, services, utilities, and UI components.

## Tech Stack
- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- React Query + `@tanstack/react-table`
- Elysia (request handling in catch-all API route)
- Yahoo Finance (unofficial `yahoo-finance2`) + controlled Google Finance scraping

## Setup
1. Prerequisites: Bun (preferred) or npm.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the dev server:
   ```bash
   bun dev
   ```
4. Lint:
   ```bash
   bun lint
   ```
5. Build:
   ```bash
   bun run build
   ```

## Data & Environment
- Portfolio source: `E555815F_58D029050B.xlsx` at repo root. Columns detected case-insensitively: `particulars`, `purchasePrice`, `quantity`, `exchangeCode`, `sector` (optional). If missing/invalid, a typed fallback seed is used.
- No secrets are required client-side. API calls stay server-only.
- Environment variables: none required for local use. Configure HTTP proxies via standard env vars if needed.

## How Live Data Works
- CMP: Yahoo Finance via `yahoo-finance2` using exchange suffixes (`.NS` for NSE, `.BO` for BSE).
- P/E & earnings: controlled scrape of Google Finance pages (UA header + timeout). If unavailable, falls back to Yahoo summary modules.
- Caching: CMP cached ~12s; stats cached ~5m. Holdings cached after initial load to avoid repeated file I/O.
- Rate limit: simple sliding window (60 req/min per client id).

## Architecture
- API: `app/api/[[...slugs]]/route.ts` (catch-all) forwards to Elysia router for `/api/portfolio` and `/api/health`.
- Services: `src/lib/portfolio-service.ts`, `src/lib/finance.ts`, `src/lib/portfolio-loader.ts`.
- Utilities: `src/lib/calculations.ts`, `src/lib/formatters.ts`, `src/lib/cache.ts`, `src/lib/rate-limit.ts`.
- UI: `components/PortfolioDashboard.tsx`, `components/PortfolioTable.tsx`, `components/SectorSummary.tsx` with React Query for polling and TanStack Table for rendering.

## Known Limitations
- Unofficial Yahoo/Google endpoints can change or throttle; scraping selectors may need updates.
- CMP/PE may be delayed if upstreams rate-limit; graceful fallbacks render `—`.
- No authentication (public dashboard). Add Clerk or similar if access control is required.
- In-memory caching/rate limiting resets on redeploy; use a shared store for multi-instance deployments.

## Deployment (Vercel)
- Ensure Bun is available in the build environment or switch scripts to npm.
- Deploy as standard Next.js App Router project; API routes run on the Node.js runtime (`runtime = "nodejs"`).
