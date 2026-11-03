# JavaScript local-first boundary

For this HR rewrite, preserve the specification's API semantics while implementing the user-authorized JavaScript/browser-only target with a small IndexedDB adapter.

## What Happened
Task t1 found that the build specification describes TypeScript, Dexie, React Router and several infrastructure libraries, while clarification explicitly overrides this to JavaScript, local-only, no backend or complex architecture. The current source has all state in `App.jsx` and localStorage.

## Takeaway
Keep a promise-based `api/index.js` contract and resource-oriented stores, but use native IndexedDB and lightweight route handling unless dependency evidence requires more. Do not expose incomplete modules in navigation; expand only after their controls and persistence are complete.

## History
- 2026-11-03 (hr/t1): initial
- 2026-11-03 (hr/t1 retry): reaffirmed the seven-unit minimum boundary and documented the JavaScript override as authoritative over the generated TypeScript project profile.
