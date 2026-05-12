# End-to-End Optimization Sprint: Final Report

## Baseline Summary

- Measured on: 2026-05-12, macOS local machine
- Dataset: 200 missions, SQLite, local dev server
- Tools: curl, Prisma query logic script, backend endpoint logs
- Note: React Profiler commit duration and initial DOM node count require browser DevTools and must be filled after profiling in your browser session.

## Before and After Metrics

| Metric                            |                              Before |                                            After |
| --------------------------------- | ----------------------------------: | -----------------------------------------------: |
| Response time (ms)                | 323 ms (original N+1 logic runtime) | 103.826 ms (`GET /api/missions?page=1&limit=20`) |
| Payload size (KB)                 |        2214.72 KB (2,267,873 bytes) |                            1.87 KB (1,913 bytes) |
| DB query count                    |                                 401 |                                                2 |
| React commit duration (ms)        |                     TODO (Profiler) |                      TODO (Profiler after fixes) |
| DOM nodes (initial mission cards) |                     TODO (Elements) |                                               12 |

## Fixes Applied

1. Bug #1: N+1 query removed by replacing per-mission crew/log loop with a paginated `findMany`.
2. Bug #2: Pagination added with `page`, `limit`, `skip`, `take`, and metadata (`total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`).
3. Bug #3: Payload trimmed with Prisma `select` (`id`, `name`, `launchDate`, `rocket`) so large description is excluded.
4. Bug #4: `compression()` middleware added before `cors()` and `express.json()`.
5. Bug #5: Inline card style moved to a stable module constant; `MissionCard` remains memoized.
6. Bug #6: Expensive filter/sort wrapped in `useMemo([missions, searchTerm])`.
7. Bug #7: Fetch effect fixed with `[]` dependency array and `AbortController` cleanup.
8. Bug #8: Client-side slicing implemented with `visibleCount` starting at 12 and a `Load More` button (+12 each click).
9. Bug #9: Delete handler wrapped in `useCallback` and switched to functional state updates to avoid stale closures.

## Total Improvement

Backend performance improved significantly after applying the full optimization sequence. Query count dropped from 401 to 2 per request (N+1 eliminated), payload reduced from ~2.2 MB to ~1.9 KB for the paginated response, and endpoint latency moved down to ~104 ms for page 1 with limit 20.

Frontend render-path bottlenecks (unstable prop references, expensive render computation, repeated fetch behavior, DOM overload, unstable callback identity) were fixed in code and are ready for final profiling confirmation in React DevTools.

## Deployed URL

- TODO: Add deployed URL (Render/Railway/Vercel)

## Load Test Results (optional)

- TODO: Add Artillery p95, median, throughput, and error rate

## Measurement Notes

- Baseline query count/payload/time for the original implementation were measured by reproducing the original endpoint query pattern with Prisma in a local script.
- Optimized API response was measured from the running Express endpoint using curl on `GET /api/missions?page=1&limit=20`.
