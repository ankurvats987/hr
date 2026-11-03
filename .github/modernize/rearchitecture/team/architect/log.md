## [t1] Source-anchored local HR architecture
- Codebase/domain discoveries: the prototype is a single `App.jsx` with in-memory page routing and one localStorage blob; the requested browser-only override changes the target from the spec's TypeScript/Dexie stack to JavaScript with a small IndexedDB API boundary.
- Wrong assumptions and corrections: the authoritative spec requests many modules, but clarification explicitly permits cutting incomplete modules from navigation; the migration boundary therefore focuses on complete people, leave, attendance, timesheets, hiring/onboarding workflows.
- Debugging dead-ends and what actually worked: context/decision/team history files were not yet present; clarification and project-profile artifacts supplied the needed constraints.
- Techniques/patterns worth reusing: use source line anchors for units, keep shared app state/audit/notifications centralized, and treat API method/error semantics as stable even when the adapter is local.
- Learnings consumed: [(none)]

## [t1] Flat architecture artifact retry
- Codebase/domain discoveries: authoritative spec sections 0, 2, 4, H1/H2/H3/H4/H6/H7/H9 define the control, API, persistence, and seven-module minimum boundary; current prototype remains a 475-line App.jsx/localStorage monolith.
- Wrong assumptions and corrections: the generated project profile still says TypeScript, but clarification and coordinator inbox explicitly override that to JavaScript/local-only; the artifact now treats the override as authoritative.
- Debugging dead-ends and what actually worked: context.md and decisions.md were absent at their expected paths; board, clarification, inbox, prior artifacts, and the spec supplied sufficient evidence.
- Techniques/patterns worth reusing: keep a flat artifact as the downstream entry point while linking source-anchored global/per-unit artifacts; record frozen API/error/side-effect contracts and deferred navigation explicitly.
- Verification: `npm run lint` passed; `npm run build` passed; flat artifact exists and is non-empty.
- Learnings consumed: [architect/javascript-local-first-boundary]
