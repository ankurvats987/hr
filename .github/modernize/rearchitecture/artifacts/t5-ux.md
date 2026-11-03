# t5 — UX and accessibility re-review

## Verdict

**PASS with follow-up findings** — prior HIGH findings are resolved. No HIGH or CRITICAL findings remain. The implementation is usable on desktop and browser interaction smoke checks passed; one MEDIUM responsive issue remains for the People table.

**Severity counts:** 0 CRITICAL, 0 HIGH, 1 MEDIUM, 0 LOW.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t4-frontend.md` — implemented route/workflow boundary and baseline gaps.
- `.github/modernize/rearchitecture/artifacts/t5.1-frontend.md` — remediation claims for keyboard rows, dialog behavior, menus, validation, feedback, and search.
- `.github/modernize/rearchitecture/clarification.md` — JavaScript React/Vite, local-only scope, WCAG 2.1 AA, and responsive requirements.
- `D:\hr\hr-app-build-spec-v2.md` — authoritative control contract and responsive/accessibility requirements.
- `.github/modernize/rearchitecture/learnings/ux/keyboard-modal-review.md` — focusable row and modal checklist.
- `.github/modernize/rearchitecture/learnings/ux/local-hr-workflow-spec.md` — route, control-outcome, and responsive review contract.

## Evidence Mapping

- `t5.1-frontend.md#Evidence Mapping` → browser smoke confirms keyboard-row, menu, validation, feedback, and search remediation is present.
- `clarification.md#Frontend` → responsive viewport check and WCAG-oriented control review.
- `hr-app-build-spec-v2.md#2.1 The control contract` → visible actions inspected for navigation, persisted mutation, feedback, or real menu/dialog outcomes.

## Prior HIGH Finding Verification

| Prior finding | Verification | Result |
|---|---|---|
| Focusable People rows lacked Enter/Space activation | Rows expose `tabIndex=0`, click handler, and Enter/Space `onKeyDown`; browser snapshot exposes rows and view buttons | **Resolved** |
| Timesheet dialog lacked Escape/focus handling | `Dialog` has `role=dialog`, `aria-modal`, labelled heading, initial focus, Escape close, Tab containment, and focus restoration | **Resolved in source review**; direct replay used an incorrect locator name |
| Account/navigation controls were ambiguous or dead-end | Account menu has `aria-expanded` and persona menu items; mobile nav has labelled expanded menu button; notifications menu has real content/empty state | **Resolved** |

## Browser and Responsive Review

Browser automation was available through the integrated Playwright browser. Checks passed against `http://127.0.0.1:5187/`:

- Workspace setup → Home navigation.
- Home “Check in / out” → Attendance route.
- Check-in mutation → visible “You are checked in” state and local saved toast.
- Notifications menu opens with an explicit “You’re all caught up” state.
- Account menu opens as a persona menu.
- People route renders an accessible table with row labels and per-row “View …” buttons.
- Isolated Vite server returned HTTP 200.

### MEDIUM — People table creates horizontal document overflow at 360px

- **Evidence:** at viewport `360x800`, Playwright measured `document.body.scrollWidth = 560`, table width `543`, and `.table-wrap` computed `overflow-x: visible`.
- **Impact:** the primary People directory is not contained within a required mobile width. Users must horizontally scroll the whole page, and the right-side action column can be off-screen.
- **Recommendation:** give the table wrapper `overflow-x: auto` with an explicit minimum table width, or provide a deliberate mobile card/list transformation. Keep row actions reachable without page-level overflow.
- **Severity:** MEDIUM; workflow remains reachable, but responsive acceptance is not met.

### Additional observations (not severity findings)

- Notification and account popovers use separate state, so opening one does not close the other; consider mutual exclusion and close-on-route-change.
- Direct dialog replay used “Add timesheet entry” while the accessible name is “Add time entry”; this is a test-selector issue, not an implementation failure.
- No placeholder or “coming soon” copy was found in the shipped route boundary; deferred modules remain absent from navigation.

## Accessibility Review

- Keyboard focus-visible styling is defined for buttons, links, fields, and keyboard-activated rows.
- People rows support pointer and keyboard activation; nested view buttons stop propagation.
- Dialog has labelled title, modal semantics, Escape close, initial focus, focus containment, and focus restoration.
- Forms use native labels/required controls and expose validation through `role="alert"`.
- Toast mutation feedback uses `role="status"`.
- Menus expose expanded state and menu/menuitem semantics where applicable.
- Mobile navigation has a labelled menu trigger and expanded state.

## Test Results

- Command: `npm run lint` — Passed: 1; Failed: 0; Skipped: 0.
- Command: `npm run build` — Passed: 1; Failed: 0; Skipped: 0.
- Browser/runtime checks — Passed: 7; Failed: 0; Skipped: 1 direct dialog replay due to incorrect locator name.
- Runtime server: `npx vite --host 127.0.0.1 --port 5187` — HTTP 200.

```yaml
environment:
  docker: UNAVAILABLE — not required for browser-only UX review
  node: AVAILABLE — v22.16.0
  playwright: AVAILABLE — v1.64.1 integrated browser
  infra-tier: FALLBACK(embedded/in-memory) — local browser-only application
  browser-tier: PRIMARY(Playwright) — integrated Chromium browser available
startup: PASS — npx vite --host 127.0.0.1 --port 5187, HTTP 200
integration: UNVERIFIED — exit_code: n/a, passed: 0, failed: 0, skipped: 0, no integration suite configured
e2e: PASS — exit_code: 0, passed: 7, failed: 0, flows tested: setup, home navigation, attendance mutation, notification menu, account menu, people table, 360px layout measurement
overall: PASS — zero HIGH/CRITICAL findings; one MEDIUM responsive follow-up remains
```
