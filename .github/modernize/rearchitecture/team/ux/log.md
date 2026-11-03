## [t3] Designed the local HR application experience
- Codebase/domain discoveries (gotchas, non-obvious behavior): The authoritative specification requires seven complete local workflows and explicitly forbids placeholder navigation; the architect artifact confirms URL-backed list state, audit/notification side effects, and identity links across modules.
- Wrong assumptions and corrections: The spec’s preferred TypeScript/library stack is overridden by the authorized JavaScript/local-only clarification; UX therefore describes behavior and contracts without prescribing implementation libraries.
- Debugging dead-ends and what actually worked: Several expected team context files were absent; clarification, board, architect artifact, and authoritative spec provided sufficient evidence.
- Techniques/patterns worth reusing for future tasks: Define route allow-list, state/feedback behavior, responsive transformation, accessibility, and control outcomes per workflow so frontend can implement without guessing.
- Learnings consumed: [(none)]

## [t5] Reviewed implemented HR workflows and accessibility
- Codebase/domain discoveries (gotchas, non-obvious behavior): The implementation has a clean allow-list and local mutation feedback, but employee table rows are focusable without keyboard activation and the shared dialog lacks Escape/focus management.
- Wrong assumptions and corrections: A successful lint/build does not establish browser behavior; Playwright was blocked by a missing Chromium executable.
- Debugging dead-ends and what actually worked: Browser launch was attempted against the Vite server; static source/CSS review supplied concrete findings when the browser could not launch.
- Techniques/patterns worth reusing for future tasks: Review every visible affordance against a concrete outcome, then separately assess keyboard semantics, modal focus, responsive transformations, and deferred navigation.
- Learnings consumed: [ux/local-hr-workflow-spec]

## [t5-re-review] Re-reviewed remediated HR workflows
- Codebase/domain discoveries (gotchas, non-obvious behavior): Prior keyboard-row, dialog, and menu findings are implemented; at 360px the People table wrapper leaves the 543px table visible and expands the document to 560px because `.table-wrap` has no horizontal overflow rule.
- Wrong assumptions and corrections: Integrated Playwright Chromium was available for this review, so browser checks were completed rather than marked unavailable; the dialog replay locator was wrong (“Add timesheet entry” vs accessible “Add time entry”).
- Debugging dead-ends and what actually worked: Desktop interaction checks and direct viewport measurement gave reliable evidence; source review filled the dialog verification gap.
- Techniques/patterns worth reusing for future tasks: Measure `document.body.scrollWidth` against viewport width at 360px, not just inspect media-query presence; verify every popover and route transition independently.
- Learnings consumed: [ux/keyboard-modal-review, ux/local-hr-workflow-spec]
