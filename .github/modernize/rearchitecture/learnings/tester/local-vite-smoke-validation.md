# Local Vite Smoke Validation

For browser-local React/Vite apps, deterministic validation may require selecting a free Vite port and invoking Vite directly when existing listeners occupy the requested port.

## What Happened
Task t6 validated the HR app with lint, build, HTTP startup, and an integrated browser flow. Existing Vite processes caused the requested port to return 404 from an unrelated/stale listener; `npx vite --host 127.0.0.1 --port 5177` returned the app correctly.

## Takeaway
Probe the selected port with HTTP before browser testing, and use direct Vite invocation on a confirmed free port when `npm run dev` port forwarding is ambiguous.

## History
- 2026-11-03 (hr/t6): initial
