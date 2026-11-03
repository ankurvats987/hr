# t1 — Existing HR Application and Build Specification Analysis

## Summary

The repository is a small React 19/Vite 8 JavaScript prototype. Its root composition, navigation, persistence, mutations, and presentation are concentrated in `src/App.jsx` (475 lines), with global styles in `src/App.css` and `src/index.css`. The authoritative specification (`hr-app-build-spec-v2.md`) explicitly rejects this one-file/localStorage shape and requires a local-first HR product with real controls, persistence, auditability, URL routes, and module-specific workflows.

The user clarification is authoritative over the specification's preferred technology choices: retain JavaScript/JSX, React/Vite, browser-only operation, no backend, no TypeScript migration, no complex state library, and validate with `npm run lint` and `npm run build`.

## Current-State Evidence

- Entrypoint: `src/main.jsx:1`; root `App` composition and all domain behavior: `src/App.jsx:1-475`.
- State seed and local persistence: `src/App.jsx:4-46` and `src/App.jsx:75-92`; one `hr-demo-state` localStorage JSON blob.
- Navigation: `src/App.jsx:48-60` and `src/App.jsx:75-170`; in-memory page labels, not URL routes.
- Functional prototype units: app shell, home/tasks, people, time off/requests, attendance, timesheets, hiring/onboarding.
- Incomplete seeded feature pages are exposed by a shared renderer (`src/App.jsx:347-455`), including org chart, offboarding, reviews, documents, announcements, calendar, help desk, reports, payroll inputs, automations, audit log, and settings. These are not complete workflows and must not remain in target navigation.
- Existing package metadata contains React/ReactDOM, Vite, and ESLint only; no router, persistence adapter, query library, or test runner.
- `src/index.css` imports a remote Google font, conflicting with the no-runtime-network requirement.

## Authoritative Requirements and Constraints

The following requirements drive the target design:

1. Every visible control must have a persisted result, real navigation/content, a working dialog/menu, generated output, a display preference change, or an explained refusal (spec §2.1).
2. No placeholders, fake actions, “coming soon”, or seeded-row-only behavior; unfinished modules must be absent from navigation, routes, settings, and guide (spec §0.3, §2.2).
3. Browser data is local and durable in IndexedDB; screens access storage only through an API layer; writes are audited (spec §0.1, §0.3, §4).
4. Preserve Material-inspired tokens/layout while bundling fonts/icons and avoiding runtime network calls.
5. Preserve canonical dates (`YYYY-MM-DD`) and UTC ISO timestamps; records use IDs, versions, created/updated metadata, and archive semantics.
6. Preserve role-aware behavior, optimistic version checks, validation/error contracts, and cross-module effects.
7. Support responsive, keyboard-accessible UI and WCAG AA behavior as far as the authorized implementation scope allows.

## Target Blueprint (authorized JavaScript boundary)

Use a small, explicit layering model:

```text
src/features/*  ->  src/api/index.js  ->  src/api/local/indexedDb.js
       \                 |
        -> src/engines/* (pure domain rules)
        -> src/ui/* (shared presentation primitives)
```

- `features/*`: one screen/workflow boundary per shipped module; no direct IndexedDB, localStorage, or fetch access.
- `api/index.js`: promise-based resource API and stable error shape. It is the only data boundary used by UI.
- `api/local/*`: native IndexedDB adapter, migrations, repositories, audit and notification side effects. Keep the adapter replaceable by a later HTTP transport.
- `engines/*`: pure leave-day counting, approval transitions, attendance/timesheet rules, hiring pipeline transitions, and task derivation.
- `ui/*`: Material-inspired buttons, fields, dialogs, tables, status chips, navigation, and responsive primitives; must not import feature code.
- Lightweight `history.pushState` route table is sufficient; do not add a router dependency unless implementation evidence requires it.
- Keep React state for transient view state only; persisted resources are queried/mutated through the API boundary.

## Minimum Runnable Boundary

Ship only the complete functional core:

1. App shell/workspace/session setup and URL navigation.
2. Home and tasks with live derived widgets and persisted completion.
3. People directory with create/edit/search and audit records.
4. Time off and requests with submit, approve/reject, balances/calendar derivation, notifications.
5. Attendance with check-in/out and regularization state.
6. Timesheets with submit/approve and locked-state refusal.
7. Hiring/careers and onboarding with real application, ordered stage transitions, hire conversion, and onboarding tasks.

Defer payroll, expenses, documents/signatures, performance, offboarding, learning, engagement, help desk, assets, reports, and automations until their controls and persistence are complete. They must be removed from navigation rather than represented by seeded rows or placeholders.

## Resource and State Contracts

Minimum stores/entities:

`workspace`, `users`, `sessions`, `employees`, `leaveRequests`, `leaveBalances`, `attendanceEntries`, `timesheets`, `jobs`, `candidates`, `onboardingTasks`, `tasks`, `notifications`, and `auditEntries`.

Every record should carry `id`, `version`, `createdAt`, `updatedAt`, and actor metadata. Use IDs for relations: time records reference employees; candidates reference jobs; onboarding tasks reference employees; audit entries reference actor/entity. Use `YYYY-MM-DD` for calendar dates and UTC ISO strings for timestamps.

The frozen local-resource API is:

```text
list(resource, query)
get(resource, id)
create(resource, body)
update(resource, id, patch, version)
action(resource, id, name, payload)
remove(resource, id)
```

Successful writes return the updated record with an incremented version. Adapter-neutral errors are `validation`, `unauthenticated`, `forbidden`, `not_found`, `conflict`, `rule_violation`, `locked`, `quota`, and `unsupported`, optionally with field errors or conflict details.

Cross-unit contracts:

- Leave request approval changes status, updates balance/calendar derivation, and writes audit + notification.
- Employee identity is the foreign-key source for attendance, timesheets, and dashboard widgets.
- Candidate transition to Hired creates an employee/pending-hire record and actionable onboarding tasks.
- Every successful mutation creates exactly one audit entry; notifications are emitted for approval/request effects.

## Unit Guidance

| Unit | Implementation boundary | Completion evidence |
|---|---|---|
| app-shell | `features/app-shell`, route table, session/persona state, navigation | Deep links work; only complete modules are listed; local/API mode is explicit |
| home-and-tasks | live API-backed widgets and task mutation | Task completion persists and reloads; manager/admin approvals reflect live data |
| people | employee directory and mutation forms | Search across name/role/team/location; create/edit works for new records; audit is visible |
| time-off-and-requests | request form, balances/calendar, approval inbox | Validation/refusal works; manager/admin controls enforce role; approval effects are persisted |
| attendance | time records and check-in/out/regularization | State survives reload; missing checkout/regularization is explicit |
| timesheets | entries and submit/approve lifecycle | Locked/approved refusal is explained; submit/approve persists |
| hiring-and-onboarding | careers application, candidate pipeline, hire conversion, tasks | Arbitrary candidate form creates reference; ordered transitions and onboarding seed work |

Use the existing per-unit behavior/binding/decomposition artifacts for source-anchored side effects, branches, error paths, and runtime bindings.

## Migration Strategy and Risks

**Strategy:** incremental local rewrite with cleanup of the monolith once each functional boundary is moved. Do not copy the shared localStorage blob into a new module. Seed a versioned IndexedDB workspace and provide a reset/sample-workspace action only where it is a real persisted operation.

**High risks and mitigations:**

- **Persistence drift:** direct component storage access can bypass audit/versioning. Mitigate with lint/import discipline and a single API adapter.
- **Behavior loss:** replacing display strings with records can drop approval, notification, or onboarding effects. Preserve the cross-unit contracts above and test each mutation.
- **Authorization illusion:** hiding controls is insufficient. Enforce persona/role checks inside API actions and return `forbidden`/`locked`.
- **Route dead ends:** incomplete modules can remain reachable through stale labels/deep links. Define a route allow-list and return a real not-found/redirect for deferred routes.
- **Schema evolution:** IndexedDB schema changes can strand existing prototype data. Treat old localStorage as an optional one-time import/reset path; use explicit database version migrations.
- **Offline/privacy:** no remote font or API calls; use bundled/local assets and document the local-browser security limitation.

## Required Verification

For the implementation phase, run from `D:\hr`:

```text
npm run lint
npm run build
```

Also manually smoke the browser app: start Vite, verify the shell responds over localhost, navigate each shipped route, reload after representative writes, and verify no deferred module appears. The architecture artifacts currently enumerate 7 units and provide matching behavior/binding/decomposition files.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/clarification.md` — JavaScript/local-only scope, deferred-module rule, accessibility/browser assumptions, and required lint/build commands.
- `.github/modernize/rearchitecture/board.md` — coordinator decision for the seven-unit functional core and IndexedDB/API boundary.
- `.github/modernize/rearchitecture/team/architect/inbox.md` — broadcast architecture decision.
- `.github/modernize/rearchitecture/learnings/architect/javascript-local-first-boundary.md` — prior guidance to preserve API semantics behind a lightweight local adapter.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — measured 480 LOC JavaScript prototype and current structure.
- `.github/modernize/rearchitecture/artifacts/architecture_index.md` — existing implementation navigation and per-unit evidence requirements.
- `.github/modernize/rearchitecture/artifacts/unit_graph.yaml` — seven externally reachable units, dependencies, and source anchors.
- `.github/modernize/rearchitecture/artifacts/migration_boundary.yaml` — smallest runnable boundary and explicit deferred cleanup.
- `.github/modernize/rearchitecture/artifacts/project-structure.md`, `tech-stack.md`, `data-model.md` — current/target layers, runtime constraints, and entities.
- `.github/modernize/rearchitecture/artifacts/wire_contracts.yaml`, `shared_modules.yaml`, `cross_unit_state.yaml` — frozen API, shared side effects, and cross-unit flows.
- `.github/modernize/rearchitecture/artifacts/units/*/{behavior,bindings,unit_decomposition}.yaml` — per-unit preservation and completion contracts.

## Evidence Mapping

- `clarification.md#Generic` → authorized JavaScript/local-only target, deferred navigation rule, and lint/build verification.
- `hr-app-build-spec-v2.md#0.2-0.3` → replacement of localStorage/placeholder pages, no-network requirement, and control contract.
- `hr-app-build-spec-v2.md#4.2-4.4` → layered API/local persistence design and resource methods.
- `hr-app-build-spec-v2.md#H1-H2,H3,H4,H6,H7,H9` → seven-unit runnable boundary and the unit completion table above.
- `project-profile.yaml#project` and `src/App.jsx:1-475` → current monolith, state, navigation, and persistence findings.
- `unit_graph.yaml#units` → unit list, source anchors, and dependencies.
- `wire_contracts.yaml#contracts` and `cross_unit_state.yaml#flows` → API, approval, hiring, audit, notification, and identity-preservation contracts.
- `migration_boundary.yaml#must_rewrite/smallest_runnable_boundary` → implementation scope and deferred modules.

## Test Results

- Analysis-time source inspection: completed; no production source was modified.
- `npm run lint`: not rerun in this retry; existing architecture index records a prior pass with 0 errors.
- `npm run build`: not rerun in this retry; existing architecture index records a prior Vite production-build pass with exit code 0.
- Runtime endpoint verification: not applicable to this browser-only analysis artifact; tester owns application runtime validation.
