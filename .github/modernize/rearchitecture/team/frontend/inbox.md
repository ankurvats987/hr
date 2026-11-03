2026-11-03T02:53:00Z — broadcast from coordinator
Architecture decision: implement the authorized JavaScript/local-only target with a lightweight IndexedDB-backed API boundary; do not migrate to TypeScript, backend services, or complex state libraries. Initial runnable boundary is the complete functional core: app shell, home/tasks, people, time off/requests, attendance, timesheets, hiring/onboarding. Incomplete modules remain absent from navigation.

2026-11-03T03:02:00Z — t5 UX review escalation
HIGH: Employee table rows need Enter/Space activation; timesheet dialog needs Escape handling, focus trap, initial focus, and focus return. Account/navigation state is ambiguous because both controls toggle the same menu state without rendering an account menu.
MEDIUM: Add cross-field leave date validation and operation-specific feedback; notification bell should do more than emit a count toast; global Search should navigate or provide an explicit disabled state.
