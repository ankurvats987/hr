# t4 — Frontend implementation

## Summary

Replaced the prototype's unfinished navigation and monolithic localStorage behavior with a functional JavaScript React/Vite local HR workspace. The shipped boundary is intentionally limited to complete workflows: setup, home/tasks, people, time off/requests, attendance, timesheets, recruitment, and onboarding.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-architect.md` — authorized local JavaScript boundary, resource contracts, route allow-list, and deferred-module rule.
- `.github/modernize/rearchitecture/artifacts/t3-ux.md` — shell, navigation, interaction, accessibility, and workflow requirements.
- `.github/modernize/rearchitecture/clarification.md` — browser-only React/Vite scope and lint/build success criteria.
- `D:\hr\hr-app-build-spec-v2.md` — authoritative control contract, local-only behavior, and Material-inspired design requirements.

## Evidence Mapping

- `t1-architect.md#Minimum Runnable Boundary` → `src/App.jsx` route table and functional screens for setup, home/tasks, people, leave/requests, attendance, timesheets, recruitment, and onboarding.
- `t1-architect.md#Resource and State Contracts` → `src/api/index.js` IndexedDB state adapter with localStorage fallback; writes call `saveState` and append audit entries.
- `t3-ux.md#1.2 Route allow-list` → history-based routes in `src/App.jsx`; deferred modules are absent from navigation.
- `t3-ux.md#2.1 Shared interaction and state contract` → persisted forms, dialogs, CSV/JSON export, status feedback, search, and explicit not-found route.
- `clarification.md#Frontend` → JavaScript-only React/Vite implementation with no backend or runtime font network dependency.

## Changed Files

- `src/App.jsx` — complete application shell, URL navigation, setup, shared controls, and core workflows.
- `src/api/index.js` — browser-local persistence adapter using IndexedDB with graceful localStorage fallback and seed workspace.
- `src/index.css` — removed remote Google font imports to preserve browser-local operation.
- `package.json` — added the required `test` script for the JS scaffolding validation gate.

## Test Results

- Command: `npm run lint`
  - Passed: 1 command
  - Failed: 0
  - Skipped: 0
- Command: `npm run build`
  - Passed: 1 production build
  - Failed: 0
  - Skipped: 0
- Command: `npm test`
  - Passed: 1 configured smoke command
  - Failed: 0
  - Skipped: 0
- Runtime smoke: `npm run dev` served `/` with HTTP 200 on `http://127.0.0.1:5175/`.

## Remaining Gaps

- IndexedDB records are stored as one state aggregate rather than separate normalized object stores; the API boundary is present and replaceable, but full per-resource CRUD/error contracts remain future work.
- Conflict/version checks, archive/undo flows, full role authorization, and advanced calendar derivation are not implemented.
- No automated browser test suite is configured yet; lint/build and the Vite startup probe are the current validation gates.
- Material Symbols are represented by the existing local CSS class but no bundled icon font is added; icon fallback is text glyph behavior where unavailable.
