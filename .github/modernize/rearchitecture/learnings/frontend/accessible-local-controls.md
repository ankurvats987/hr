# Accessible local controls

Local React controls should expose explicit state and keyboard behavior even when persistence is browser-only.

## What Happened

Task t5.1 found that shared menu state made navigation, account, and notification affordances ambiguous, while a custom dialog lacked the standard focus lifecycle. The remediation uses separate booleans, ARIA expanded/menu semantics, and a reusable Escape/focus-trap/focus-return dialog effect.

## Takeaway

For lightweight React implementations, keep transient UI state separate by concern and implement modal behavior at the shared dialog boundary. Add operation-specific feedback at the persistence mutation boundary so every workflow receives an observable result without duplicating toast logic.

## History

- 2026-11-03 (hr/t5.1): initial
