# Architecture implementation guide

This index is navigation, not the full contract. Before implementing a unit, read its three per-unit artifacts plus the referenced global rows. `migration_boundary.yaml::must_rewrite` is the implementation scope; source anchors prove behavior but do not independently mandate extra work.

## Global artifacts
- `project-structure.md` — domains, current monolith, target layer rules.
- `tech-stack.md` — authorized JavaScript/Vite constraints and blockers.
- `data-model.md` — minimum stores and relationships.
- `unit_graph.yaml` — entry points, dependencies, and shared references.
- `migration_boundary.yaml` — smallest runnable boundary and explicit deferred modules.
- `wire_contracts.yaml` — API and cross-module contracts; preserve method/error semantics.
- `shared_modules.yaml` — fields that must be migrated once, not duplicated.
- `cross_unit_state.yaml` — flows requiring event/audit/notification preservation.

## Implementation guide
For every unit, read `units/<name>/behavior.yaml`, `bindings.yaml`, and `unit_decomposition.yaml`. Filter `wire_contracts.yaml` by the unit's consumer list and `cross_unit_state.yaml` by writers/readers. Completion evidence must include working controls, persisted reload behavior, audit writes for mutations, and lint/build output.

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
