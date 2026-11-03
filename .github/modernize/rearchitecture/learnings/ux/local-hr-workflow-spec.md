# Local HR workflow UX specification

The seven-workflow local HR boundary needs explicit route, state, responsive, accessibility, and control-outcome contracts before frontend implementation.

## What Happened

For t3, the UX contract was derived from `hr-app-build-spec-v2.md`, clarification, and the architect artifact. The key decision is to specify complete behavior only for shell/setup, home/tasks, people, time off/requests, attendance, timesheets, and recruitment/onboarding; deferred domains must be absent rather than represented by placeholders.

## Takeaway

For each shipped workflow, document URL, list/form anatomy, valid state transitions, persistence feedback, empty/loading/error states, keyboard behavior, and xs transformation. Keep primary actions singular per region and make blocked actions explain the prerequisite.

## History

- 2026-11-03 (hr/t3): initial
