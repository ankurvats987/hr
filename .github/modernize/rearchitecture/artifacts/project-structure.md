# Project structure

## Evidence
- Project type: single-page React/Vite browser application.
- Current entrypoint: `src/main.jsx:1`; root composition and all behaviors are in `src/App.jsx:1-475`.
- Presentation styles are global in `src/App.css` and `src/index.css`.
- Current navigation is an in-memory page switch (`src/App.jsx:48-60`, `src/App.jsx:75-170`), not URL routing.
- Current persistence is one `localStorage` JSON value (`src/App.jsx:75-92`).

## Functional domains observed
- Workspace shell and self-service: Home, tasks, guide, notifications, persona switching.
- People and work time: People, Time off, Attendance, Timesheets, Requests.
- Talent: Hiring, Careers, Onboarding.
- Placeholder/admin pages: feature-page rendering for several navigation labels (`src/App.jsx:347-455`).

## Target layering
Use a small JavaScript equivalent of the specification's layers:
`features/*` screens -> `api/index.js` resource client -> `api/local/*` IndexedDB adapter -> pure `engines/*`.
`ui/*` owns Material-inspired primitives and must not import feature code. Keep only modules with complete controls in navigation.
