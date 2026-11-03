# Data model

## Current stores
`initialState` in `src/App.jsx:4-38` contains leave requests, attendance, timesheets, jobs/applicants, onboarding, notifications, audit entries, and admin demo rows. `people` at `src/App.jsx:40-46` is the employee seed.

## Target entities
All records should carry `id`, `version`, `createdAt`, `updatedAt`, and audit metadata. Minimum functional stores:
- `workspace`, `users`, `sessions`
- `employees`, `leaveRequests`, `leaveBalances`, `attendanceEntries`, `timesheets`
- `jobs`, `candidates`, `onboardingTasks`
- `notifications`, `auditEntries`

Relationships use IDs: leave/attendance/timesheet -> employee; candidate -> job; onboarding task -> employee; audit entry -> actor and entity. Keep dates as `YYYY-MM-DD` and timestamps as UTC ISO strings.

## Deferred entities
Payroll, expenses, documents/signatures, performance, offboarding, learning, engagement, help desk, assets, reports, and automations require additional complete workflows. They are not represented in navigation until their stores and controls are implemented.
