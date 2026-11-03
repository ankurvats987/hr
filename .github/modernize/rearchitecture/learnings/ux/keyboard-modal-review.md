# Keyboard and modal review

UX review of local React workflows should treat focusable table rows and dialogs as separate accessibility contracts, not infer compliance from ARIA attributes alone.

## What Happened

For t5, employee rows had `tabIndex` and click navigation but no Enter/Space handler, while the timesheet dialog had `aria-modal` but no Escape handling, focus trap, initial focus, or focus return. Both are invisible regressions for keyboard users.

## Takeaway

When reviewing React UI, verify that every focusable non-native control has keyboard activation and that every modal has Escape, focus containment, focus placement, and focus restoration. Add `:focus-visible` styling as a separate visual check.

## History

- 2026-11-03 (hr/t5): initial
