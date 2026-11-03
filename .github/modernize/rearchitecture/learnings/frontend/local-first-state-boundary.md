# Local-first state boundary

Keep React UI state transient and persist the workspace through a small adapter module so the browser-only implementation can later swap to an HTTP transport.

## What Happened

Task t4 implemented `src/api/index.js` with IndexedDB as the primary store and a localStorage fallback, while `src/App.jsx` uses `loadState`/`saveState` rather than accessing storage directly in components.

## Takeaway

For a fast JavaScript rewrite, a single aggregate IndexedDB record can establish the persistence boundary without introducing a state library. Keep the adapter import stable and centralize mutation/audit behavior in the app service callback.

## History

- 2026-11-03 (hr/t4): initial
