# Technical Document

## API Strategy and Scraping Risks
- CMP is fetched via `yahoo-finance2` using exchange suffix mapping (`.NS`/`.BO`). Results are cached for 12s to avoid hammering Yahoo endpoints.
- P/E ratio and latest earnings are scraped from Google Finance with a desktop UA, 7s timeout, and minimal selectors (`div:contains("P/E ratio")`, `div:contains("Earnings per share")`). When scraping fails, Yahoo summary modules (`trailingPE`) provide a fallback.
- All finance lookups run server-side only inside `app/api/[[...slugs]]/route.ts` through an Elysia router to keep scraping logic off the client.
- Risks: unofficial endpoints may change DOM structure or rate-limit aggressively. Scraper selectors may need maintenance if Google adjusts markup.

## Caching and Rate-Limit Handling
- `TtlCache` provides in-memory TTL caching for CMP (~12s) and stats (~5m).
- Holdings from `E555815F_58D029050B.xlsx` are parsed once and memoized to avoid repeated disk I/O.
- A sliding window rate limiter (`rate-limit.ts`) caps requests at 60 per minute per client id (`x-forwarded-for` or `request.ip`).
- In production with multiple instances, move caches and rate-limit state to a shared store (Redis/Upstash) to preserve consistency.

## Data Transformation
- `portfolio-loader.ts` normalizes Excel rows (case-insensitive headers) into `HoldingInput` with typed exchanges and inferred sectors when absent.
- `calculations.ts` contains pure functions to compute investment, present value, gain/loss, and portfolio percentages. These functions are side-effect free to keep calculations testable.
- `portfolio-service.ts` orchestrates loading holdings, enriching with live metrics, and emitting a `PortfolioSnapshot` used by the UI.

## Real-Time Update Approach
- Client polling is driven by React Query with a manual `setInterval` (15s) and cleanup on unmount. Stale time is 10s to reduce unnecessary renders.
- The API responds with precomputed derived fields so the client does not recompute totals on every poll.
- Static portfolio data is cached in memory; only live fields are refreshed.

## Performance Optimizations
- Memoized React Table column definitions and computed totals to avoid re-renders.
- Lightweight skeleton rows render while data loads.
- Server-side caching drastically reduces outbound calls to Yahoo/Google.
- No client-side secrets; responses are small JSON documents suited for frequent polling.

## Error Handling Design
- API errors bubble into user-friendly messages on the dashboard; missing live values show `—`.
- Finance fetches use timeouts and fallback paths; partial failures return partial data instead of failing the whole payload.
- Rate-limit responses use HTTP 429. Unexpected errors return 500 with a concise JSON error.

## Security Notes
- No credentials or API keys are stored client-side. All scraping happens on the server.
- The dashboard is public per requirements; add Clerk or another provider around the layout if authentication becomes necessary.

## Deployment Notes
- Target runtime is Node.js for the API route (`runtime = "nodejs"`).
- Preferred package manager is Bun; if unavailable in CI, switch scripts to npm without changing code paths.


