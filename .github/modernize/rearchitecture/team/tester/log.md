## [t6] Required build and startup smoke validation
- Codebase/domain discoveries (gotchas, non-obvious behavior): Vite serves correctly when invoked directly with `npx vite --host 127.0.0.1 --port <free-port>`; existing listeners made the requested port unsuitable. Setup seeds a local workspace, and employee creation persisted across reload.
- Wrong assumptions and corrections: `npm run dev -- --port 5175` was not reliable in this already-running environment because existing Vite listeners occupied the port; a direct Vite invocation on 5177 provided deterministic readiness.
- Debugging dead-ends and what actually worked: an optional `[role=status]` lookup timed out after reload; a focused `getByText('Smoke Tester')` assertion verified persistence successfully.
- Techniques/patterns worth reusing for future tasks: use integrated browser interaction for representative local flows, and record exact HTTP readiness plus lint/build exit codes.
- Learnings consumed: [(none)]
## [t7] End-to-end local HR workflow validation
- Codebase/domain discoveries: setup, People CRUD, leave, recruitment, onboarding, attendance history, and timesheet dialog are reachable and local-state backed; routes are real and deferred modules absent.
- Wrong assumptions and corrections: a clicked synthetic CSV export did not emit a Playwright download event; this is evidence gap, not proof of missing export.
- Debugging dead-ends and what actually worked: existing browser state made attendance check-out replay ambiguous; route-level reloads reliably proved employee and leave persistence.
- Techniques/patterns worth reusing: use an isolated Vite port, probe each route by URL, assert visible saved-local feedback plus read-back after reload.
- Learnings consumed: [tester/local-vite-smoke-validation]
