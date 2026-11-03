# Architecture implementation guide

This index is navigation, not the full contract. Before implementing a unit, read its three per-unit artifacts plus referenced global rows. `migration_boundary.yaml::must_rewrite` is the implementation scope; source anchors prove behavior but do not independently mandate extra work.

## Global artifacts
- `project-structure.md` — domains, current monolith, target layer rules.
- `tech-stack.md` — authorized JavaScript/Vite constraints and blockers.
- `data-model.md` — minimum stores and relationships.
- `unit_graph.yaml` — entry points, dependencies, shared references.
- `migration_boundary.yaml` — smallest runnable boundary and deferred modules.
- `wire_contracts.yaml` — API and cross-module contracts.
- `shared_modules.yaml` — fields migrated once, not duplicated.
- `cross_unit_state.yaml` — flows requiring event/audit/notification preservation.

## Implementation guide
For each unit, read `units/<name>/{behavior,bindings,unit_decomposition}.yaml`. Filter global contracts by the unit's consumer list and state flows by writers/readers. Completion evidence must include working controls, persisted reload behavior, audit writes for mutations, and lint/build output.

| Unit | Artifact paths | Required evidence |
|---|---|---|
| app-shell | `units/app-shell/{behavior,bindings,unit_decomposition}.yaml` | URL/deep-link navigation, session-aware shell, no unfinished nav entries |
| home-and-tasks | `units/home-and-tasks/{behavior,bindings,unit_decomposition}.yaml` | live widgets, task completion persisted and reflected after reload |
| people | `units/people/{behavior,bindings,unit_decomposition}.yaml` | create/edit/search employee and audit entry |
| time-off-and-requests | `units/time-off-and-requests/{behavior,bindings,unit_decomposition}.yaml` | request, approve/reject, balance/calendar and notification effects |
| attendance | `units/attendance/{behavior,bindings,unit_decomposition}.yaml` | check-in/out and regularization state persisted |
| timesheets | `units/timesheets/{behavior,bindings,unit_decomposition}.yaml` | submit/approve and locked-state refusal |
| hiring-and-onboarding | `units/hiring-and-onboarding/{behavior,bindings,unit_decomposition}.yaml` | real application, stage transitions, hired onboarding tasks |

No deferred module may appear in navigation until its complete contract and controls exist.

## Upstream Artifacts Consumed
- `.github/modernize/rearchitecture/clarification.md` — JavaScript/local-only override, scope and validation commands.
- `.github/modernize/rearchitecture/artifacts/project-profile.yaml` — measured project size, language and prototype description.

## Evidence Mapping
- `clarification.md#Generic` -> `migration_boundary.yaml` local-only strategy and deferred-module rule.
- `project-profile.yaml#project` -> `project-structure.md` and `tech-stack.md` current-state evidence.
- `hr-app-build-spec-v2.md#4.3` -> `wire_contracts.yaml` local-resource API contract.
- `src/App.jsx:4-38` -> `shared_modules.yaml` stores and `data-model.md`.
- `src/App.jsx:206-302` -> unit graph and per-unit behavior/binding artifacts.

## Verification
- Per-unit completeness: 7 units, 7 behavior files, 7 bindings files, 7 decomposition files.
- `npm run lint`: passed (0 errors).
- `npm run build`: passed (Vite production build, exit code 0).
- No source files were modified by this analysis task.
