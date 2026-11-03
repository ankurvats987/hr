# HR Demo — Kestrel Works

HR Demo is a browser-only HR workspace for the fictional 48-person company **Kestrel Works**. It is designed as a product demonstration: visitors can switch between Employee, Manager and HR Admin personas and walk through connected people-operations workflows without a backend, account, network API or external service.

The original pasted product brief remains the source of truth for the product direction. The implementation follows its Material 3-inspired visual language and demonstrates the requested HR journeys, while deliberately keeping the current demo lightweight: React components, global CSS and `localStorage` rather than the brief's proposed TypeScript/Dexie production architecture.

## Quick start

### Requirements

- Node.js with npm
- A modern browser
- No database, server account or environment variables

### Install and run

```bash
npm install
npm run dev
```

Vite binds to `127.0.0.1`. If the default port is occupied, Vite selects the next available port and prints the URL in the terminal.

### Other commands

```bash
npm run lint       # ESLint
npm run build      # Production build
npm run preview    # Preview the production build on 127.0.0.1
```

The project currently has no registered VS Code test controller or automated test suite. Browser validation has been performed manually against fresh Vite servers.

## Product intent

The demo is intended to answer these questions for a product viewer:

1. What does an employee do in the system?
2. How does a manager approve work?
3. How does HR administer people and company workflows?
4. How do leave, attendance, hiring, onboarding, documents and support connect?
5. Does an action visibly change the workspace and survive a reload?

It is not a payroll provider, legal HR system, identity provider or production employee database.

## Personas

The account menu switches the current demonstration persona:

| Persona | Sample user | Demonstrates |
|---|---|---|
| Employee | Isha Verma — Software Engineer | Request leave, check in/out, submit timesheets, complete tasks, view documents and request help |
| Manager | Rohan Kapoor — Engineering Manager | Review and approve/reject leave, approve submitted timesheets and review team activity |
| HR Admin | Meera Iyer — Head of People | Admin-oriented pages, payroll inputs, automation controls, audit activity and broader configuration |

Persona switching is a local demo view switch, not authentication. It does not provide real security boundaries.

## Application navigation

The sidebar, mobile drawer and bottom mobile navigation expose these pages:

### Work

- **Home** — dashboard, attention cards, recent activity, upcoming items and quick actions.
- **Time off** — balances, leave requests, status filter and a March calendar view.
- **Attendance** — check-in/check-out, monthly attendance rows and missing-check-out correction.
- **Timesheets** — add weekly time entries, persist notes/hours, and approve submitted entries as Manager/Admin.
- **My tasks** — complete or reopen onboarding-related tasks.
- **Requests** — Pending, Approved and All requests tabs; Manager/Admin approval actions.

### People

- **People** — searchable employee directory, add person, open profile summary and remove employee.
- **Org chart** — seeded organizational structure and row actions.
- **Hiring** — applicant pipeline from Applied to Interview 1, Offer and Hired; careers page entry point.
- **Onboarding** — checklist completion, progress and new checklist item creation.
- **Offboarding** — seeded employee exit workflow rows.
- **Reviews** — seeded review-cycle data and row progression.

### Company

- **Documents** — seeded offer letter and handbook records; upload/create, sign row action and details.
- **Announcements** — create, publish and acknowledge seeded announcements.
- **Calendar** — seeded company dates and leave-related events.
- **Help desk** — create cases, assign/resolution-style row actions and details.

### Admin

- **Reports** — seeded reports and CSV export.
- **Payroll inputs** — monthly payroll input rows and open/lock row actions.
- **Automations** — seeded rules and enable/disable row actions.
- **Audit log** — immutable-style activity view and CSV export.
- **Settings** — seeded workspace configuration rows and local actions.

### Utility navigation

- **Guide** — side-sheet explanation and checklist.
- **Demo controls** — reset data, scale-test employee counter and JSON export.
- **Careers** — public-style sample careers page reachable from Hiring; submitting an application adds a candidate to the hiring pipeline.

## Implemented workflows

### Leave request and approval

1. Open **Time off** or use **Request leave** from Home.
2. Select leave type, start date, end date and optional reason.
3. Submit the request.
4. The request is added to `leaveRequests` with `Pending` status.
5. An audit entry and unread notification are added.
6. Switch to Rohan Kapoor or Meera Iyer.
7. Open **Requests**.
8. Use Pending, Approved or All requests tabs.
9. Approve or reject the request.
10. The status, audit log and notification state update immediately.

### Attendance

- **Check in** updates the current attendance row, checked-in state and audit log.
- **Check out** records the check-out time and total.
- The seeded missing-check-out row exposes **Request correction**.
- A regularization request is persisted in `regularizations` and audited.

### Timesheets

- **Add time entry** opens a real form for week, hours and notes.
- Hours are validated to a positive value no greater than 168.
- Submitted entries are persisted in `timesheets` with `Submitted` status.
- Manager/Admin sees an **Approve** action for submitted entries.
- Approval updates status and writes an audit entry.
- Each entry's vertical menu offers View details, Approve entry where permitted and View history.

### Onboarding and tasks

- Checklist items are persisted in `onboarding`.
- Checking a task updates its `done` state and displays a completion toast.
- **Add checklist item** focuses the inline form.
- Adding a task increases the checklist and progress denominator.
- **My tasks** provides a separate task-completion view against the same onboarding state.

### Hiring and careers

- Hiring displays candidates by stage.
- Clicking a candidate advances it one stage at a time.
- Careers application creates a `Demo candidate` in the Applied stage.
- Applicant count and audit activity update.
- The Hired stage indicates onboarding readiness in the UI.

### People

- Search filters employees by name, role and team.
- Add person creates a local employee record with generated initials.
- Selecting a person opens a profile summary dialog.
- Delete removes the employee from the local directory.
- Global search can navigate to People.

### Generic row actions

Shared feature pages use a common row action menu:

- Vertical ellipsis opens a visible menu.
- **Open details** opens a real details dialog.
- **Duplicate** adds a draft copy to the visible list and audits the action.
- **Remove from view** removes the row from the current view and audits the action.

The menu is intentionally rendered outside clipped panel overflow. Menu clicks stop propagation so selecting an action does not also trigger the parent row action. This fixed the earlier bug where an “Open details” click could also sign, publish, resolve or otherwise mutate the row.

## UI and interaction behavior

The UI follows the product brief's Material 3 direction:

- Roboto typography
- Material Symbols Outlined icons
- Tonal surfaces and containers
- Rounded cards and controls
- Responsive sidebar, mobile drawer and bottom navigation
- Accessible labels for icon-only controls
- Status chips for Pending, Approved, Rejected, Open, In progress, Signed, Published, Enabled, Disabled and similar states
- Dialog scrims for forms and details
- Toast/snackbar feedback for completed actions
- No gradients or glassmorphism

Global shared controls include:

- Account/persona menu
- Notification menu with unread indicator and mark-all-read
- Global employee search
- Help/Guide sheet
- Welcome dialog and five-step tour
- Dismissible demo banner
- Responsive mobile navigation drawer

## Persistence model

All data is stored in browser `localStorage` under:

```text
hr-demo-state
```

The initial state is defined in `src/App.jsx` and includes:

- `persona`
- `leaveRequests`
- `checkedIn`
- `onboarding`
- `employees`
- `attendance`
- `timesheets`
- `jobs`
- `applicantsList`
- `documents`
- `cases`
- `announcements`
- `reviews`
- `payrollMonths`
- `automations`
- `notifications`
- `audit`
- `outbox`

The welcome state uses a separate key:

```text
hr-demo-welcomed
```

To restore the clean demo from the UI, open **Demo controls → Reset data**. To force a first-visit welcome dialog during development, clear `hr-demo-welcomed` in browser storage.

The persistence implementation merges saved state over the seed state. Consequently, older browser data can preserve older records or persona selections until Reset data or local storage clearing is used.

## Source structure

The current implementation is intentionally compact:

```text
src/
  App.jsx       Application shell, state, pages, dialogs and workflows
  App.css       Material 3-inspired application styles and responsive layout
  index.css     Global reset, fonts, symbols and base control styles
```

`App.jsx` currently contains:

- Seed data and people
- Navigation definitions
- App shell and shared menus
- Dashboard
- Time off
- People
- Attendance
- Timesheets
- Requests
- My tasks
- Hiring
- Onboarding
- Guide and tour
- Demo controls
- Generic feature pages
- Leave dialog
- Welcome dialog
- Careers page

This is functional demo code, not the final architecture proposed by the original brief.

## Conversation-driven implementation history

This section records the work completed across the conversation so the project history is not lost.

### Initial conversion

- Replaced the default Vite counter screen with the Kestrel Works HR Demo.
- Added the Material-inspired application shell, sidebar, top bar, cards and responsive layout.
- Added seed people and sample HR records.
- Added local browser persistence.
- Replaced starter CSS and README content.
- Added initial dashboard, Time off, Attendance, People, Hiring, Careers and Onboarding surfaces.
- Confirmed lint and production build.

### Startup and tutorial fixes

- Investigated why the demo appeared not to start when Vite port 5173 was occupied.
- Changed dev/preview host binding to `127.0.0.1`.
- Added a real welcome dialog.
- Replaced the original toast-only tour with a five-step guided tour:
  1. Home
  2. Time off
  3. Requests
  4. People
  5. Hiring
- Added step counter, progress bar, Next, Finish and Skip behavior.

### Navigation and module coverage

- Added navigation entries for Org chart, Timesheets, Offboarding, Documents, Reviews, Help desk, Announcements, Calendar, Reports, Payroll inputs, Automations, Audit log and Settings.
- Added generic feature pages with seeded rows, create dialogs, status chips, exports and local state.
- Added Demo controls for reset, scale-test employees and JSON export.
- Added shared data fields for employees, attendance, jobs, applicants, documents, cases, announcements, reviews, payroll months, automations, notifications, audit and outbox.

### Workflow wiring

- Added leave approval audit and notification entries.
- Added Careers application persistence.
- Added applicant pipeline progression.
- Added notification dropdown, unread state and mark-all-read.
- Added People search, add-person dialog, profile dialog, delete action and audit updates.
- Added functional Time off tabs: Overview, Requests and Calendar.
- Added leave status filtering.
- Added attendance check-in/check-out persistence.
- Added attendance regularization requests.
- Added attendance audit entries.
- Added onboarding task creation.
- Added Guide lesson runner with Start, Continue, Mark step done, Finish and Exit.
- Added dashboard stat-card navigation.
- Added dashboard calendar/upcoming navigation.
- Added dashboard quick check-in/check-out.
- Added dismissible welcome strip.
- Added dynamic Requests badge count.
- Added global search results.
- Added mobile navigation drawer.
- Added accessible labels to navigation buttons and icon controls.

### Dead-control and menu repairs

- Audited visible buttons, tabs, filters and icon controls.
- Replaced inert Requests tabs with Pending, Approved and All requests filtering.
- Made leave dialog fields controlled and date-aware.
- Calculated leave duration from selected dates.
- Added account-footer menu interaction.
- Added real Timesheets state, add-entry form, notes, hours validation and approval.
- Added Timesheets menu actions.
- Replaced generic vertical-ellipsis toast-only behavior with action menus.
- Added Open details dialogs.
- Added Duplicate and Remove from view actions.
- Fixed menu clipping caused by panel `overflow: hidden`.
- Fixed event bubbling where a menu action also triggered the parent row action.
- Fixed a React table whitespace warning.
- Fixed the sidebar account footer's browser-default rectangular button border.
- Added responsive handling for short viewport welcome dialogs.

## Browser validation history

The following behavior has been manually verified against fresh local Vite servers:

- App renders on a clean port.
- Welcome dialog appears and can be dismissed.
- Welcome tour starts and advances between pages.
- Persona menu switches Employee, Manager and HR Admin views.
- Leave request dialog opens and submits.
- Leave requests appear in Requests.
- Manager can approve a pending leave request.
- Requests tabs change the visible request set.
- Attendance Check in changes state.
- Attendance Check out changes state.
- Attendance regularization creates a request.
- Onboarding checklist items can be completed.
- Onboarding can add a new task.
- Major navigation labels render their pages.
- Dashboard cards navigate to relevant pages.
- Global search finds people and navigates to People.
- Mobile navigation drawer opens and navigates.
- Documents vertical menu opens.
- Documents Open details opens a details dialog without triggering Sign.
- Timesheets Add time entry opens.
- Timesheets creates a persisted entry.
- Timesheets vertical menu opens.
- Generic row vertical menus open and expose actions.
- `npm run lint` passes.
- `npm run build` passes.

## Known limitations and honest scope

The demo is substantially interactive, but it is not a production-complete HR platform. The following limitations remain intentional or incomplete:

- No real authentication, authorization or server-side permission enforcement.
- Persona switching is a demonstration mechanism, not security.
- Data is local to one browser and one origin.
- No IndexedDB/Dexie data layer; the original brief's proposed Dexie architecture was not implemented.
- No TypeScript migration; the current app remains JSX.
- No React Router; navigation is local page state.
- No backend APIs, database, email, calendar integration or external HR/payroll integration.
- Generic feature pages still use simplified row-backed behavior.
- Payroll inputs are not live payroll calculations.
- Reports are not fully computed analytics.
- Settings are not a complete configuration engine.
- Automations have seeded enable/disable behavior but no production event engine.
- Documents do not upload binary files or provide real signatures.
- Help desk, reviews, announcements and offboarding are demonstrations rather than full service modules.
- Hiring-to-onboarding is represented by seeded state and pipeline actions, not a complete recruiting system.
- Export is browser-generated CSV/JSON, not a server export job.
- Browser test automation is not checked into the repository.

These are documented constraints rather than silently presented as production capabilities.

## Future production architecture

To move from demo to maintainable product, the next refactor should:

1. Split `App.jsx` into shell, routes, feature components, dialogs and services.
2. Migrate to strict TypeScript.
3. Replace page-state navigation with React Router.
4. Move persistence to Dexie/IndexedDB behind typed repositories.
5. Centralize command functions for audit, notification and outbox writes.
6. Add a real permission matrix and route guards.
7. Add domain models and validation schemas for leave, attendance, timesheets, hiring, onboarding, documents, cases, reviews and payroll inputs.
8. Add automated unit tests for reducers/services.
9. Add browser E2E tests for the critical journeys.
10. Add import/export validation and versioned local-data migrations.
11. Replace generic feature rows with domain-specific screens and workflows.
12. Add real accessibility checks, keyboard navigation and focus management.

## Design reference

The visual and product direction comes from the original pasted HR Demo specification supplied during the conversation. The intended principles are:

- Material Design 3 component language
- Clear employee, manager and HR admin journeys
- Browser-only demonstration with persistent sample data
- Responsive desktop and mobile behavior
- Guided learning rather than unexplained screens
- Every visible control should either perform a stateful action, navigate, open a form/details view or provide an explicit, useful result
- No silent dead ends or misleading “success” behavior

