## [t4] Implemented local HR core
- Replaced the one-file prototype with a route-driven React shell and complete local workflows for the authorized seven-module boundary.
- IndexedDB is the primary persistence mechanism with localStorage fallback for browsers without IndexedDB.
- Deferred modules were removed from navigation rather than represented as placeholders.
- Validation passed: npm run lint, npm run build, npm test, and Vite HTTP 200 smoke probe.
- Learnings consumed: none.

## [t5.1] Remediated UX accessibility findings
- Added a reusable modal keyboard contract rather than special-casing the timesheet dialog.
- Separated navigation drawer state from account and notification menus; a single shared toggle made desktop and mobile controls ambiguous.
- Added inline date validation and operation-specific mutation feedback while retaining the aggregate local persistence adapter.
- Browser interaction automation remains blocked by missing Chromium; lint, build, and HTTP startup passed.
- Learnings consumed: [frontend/local-first-state-boundary]
