# Technology and runtime

## Current evidence
- React `^19.3.1`, React DOM `^19.3.1`, Vite `^8.3.5`, ESLint `^10.13.0` from `package.json`.
- JavaScript/JSX is the authorized target; the specification's TypeScript requirement is explicitly overridden by clarification.
- No router, query library, Dexie, form library, or test runner is currently declared.
- `src/index.css:1` imports Google Fonts at runtime, which conflicts with the no-network requirement.

## Target constraints
- Browser/local-only, no backend and no runtime network requests.
- Prefer native IndexedDB behind a promise-based resource API to avoid introducing complex dependencies.
- Add URL routing only if a lightweight dependency is justified; otherwise use `history.pushState` with a route table.
- Preserve existing Material-inspired CSS tokens while moving icons/fonts to bundled assets or text-safe fallbacks.
- Required verification remains `npm run lint` and `npm run build`.

## Migration blockers
- Existing `App.jsx` combines state, persistence, view routing, domain mutations, and presentation.
- Existing seeded feature pages are not domain implementations and must not remain reachable as completed modules.
- The current `localStorage` adapter cannot store files or provide versioned migrations.
