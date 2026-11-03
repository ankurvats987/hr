# Browser workflow evidence gaps

Interactive Playwright can prove local React state mutations and route persistence, but synthetic anchor downloads and same-day attendance transitions need dedicated assertions or a fresh-state fixture.

## What Happened
Task t7 exercised the HR app across setup, People, leave, attendance, timesheets, recruitment, onboarding, and export. Most workflows produced visible saved-local feedback and persisted records. The browser download event did not fire for the CSV anchor, and the attendance UI remained on `Check in` after a completed day.

## Takeaway
For future local-first validation, isolate browser state per run, assert both pre/post mutation labels, and validate generated file content with a download-capable harness rather than assuming a click proves bytes were emitted.

## History
- 2026-11-03 (hr/t7): initial
