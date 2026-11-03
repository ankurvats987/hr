# t3 — Local HR application experience specification

## Summary

This is the implementation-ready UX contract for the authorized browser/local-only HR application. It covers the seven complete workflows in the runnable boundary: app shell/session setup, home and tasks, people, time off and requests, attendance, timesheets, and hiring/onboarding. Deferred modules must not appear in navigation, search, settings, or reachable routes.

The experience is Material-inspired, responsive, keyboard accessible, and honest about local-only security. Every visible control follows the build specification control contract: it persists a visible result, navigates to real content, opens a working surface, generates output, changes the view in a linkable way, or is omitted/disabled with a reason.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t1-architect.md` — authorized JavaScript/local-first scope, seven-unit boundary, API/resource contracts, deferred-module rule, and cross-unit effects.
- `.github/modernize/rearchitecture/clarification.md` — browser-only JavaScript target, Material-inspired language, WCAG 2.1 AA, responsive support, and lint/build success definition.
- `D:\hr\hr-app-build-spec-v2.md` — authoritative control contract, Material tokens/components, module behavior, regional defaults, and accessibility requirements.

## Evidence Mapping

- `t1-architect.md#Minimum Runnable Boundary` → seven workflows and route allow-list in this artifact.
- `t1-architect.md#Resource and State Contracts` → visible mutation feedback, audit/notification expectations, and cross-module UX effects.
- `hr-app-build-spec-v2.md#2.1-2.3` → control outcome and standard record behavior requirements below.
- `hr-app-build-spec-v2.md#3.5-3.10` → responsive breakpoints, navigation patterns, focus, motion, and component specifications below.
- `clarification.md#Frontend` → JavaScript/React/Vite, local persistence, WCAG, and no backend/network assumptions.

## 1. Information architecture and routes

### 1.1 Shell

Every authenticated route uses the app shell:

- Top app bar: menu/back, page title, search, notifications, help, account menu.
- Permanent drawer at md/lg (256px, collapsible to 72px); modal drawer at sm; bottom navigation plus More drawer at xs.
- Content max width 1280px, 16px margins on xs and 24px otherwise, 8px spacing grid.
- Active navigation is derived from the URL. Browser back/forward and deep links restore the exact route, query, and tab.
- Drawer groups: **Workspace** (Home, Tasks, Requests), **People** (People), **Time** (Time off, Attendance, Timesheets), **Hiring** (Recruitment, Onboarding). Only routes implemented end-to-end are listed.
- Pinned primary destinations on xs: Home, Time off, Attendance, Requests, More.

### 1.2 Route allow-list

| Route | Screen and primary action |
|---|---|
| `/setup` | First-run workspace/persona setup; Create workspace and Load sample workspace |
| `/home` | Overview cards, approvals, upcoming work, quick actions |
| `/tasks` | My task list with completion and due-state actions |
| `/people` | Employee directory; New employee |
| `/people/new` | Employee creation form |
| `/people/:id` | Employee detail, edit, archive, activity |
| `/time-off` | Balances, calendar, my requests; Request time off |
| `/time-off/new` | Leave request form |
| `/requests` | Approval inbox tabs and detail drawer/page |
| `/attendance` | Today status, history, check-in/out, regularization |
| `/timesheets` | Current week entries and submit/approve lifecycle |
| `/recruitment` | Careers jobs and candidate pipeline; Apply / New candidate |
| `/recruitment/apply` | Public/local candidate application form |
| `/onboarding` | New-joiner task checklist and progress |
| `/not-found` | Honest route refusal with link to Home; no deferred module placeholder |

Record detail routes may use `?tab=overview|activity|attachments|tasks`. List search, filters, sort, density, page, and page size remain in the URL query.

### 1.3 First-run setup

On `/setup`, show a short stepper: **Workspace → Regional defaults → Your profile → Sample data**. Each step has Back/Next, inline validation, a visible progress indicator, and a final confirmation summary. Default values are INR, Asia/Kolkata, Monday start, `12 Mar 2026`, 24-hour time, fiscal year 1 April, en-IN. “Use sample workspace” clearly states it creates editable Kestrel Works records. A local-security note states that sign-in protects casual access only and does not encrypt the browser profile. Completion persists workspace/session and routes to `/home`.

## 2. Shared interaction and state contract

### 2.1 Page and list anatomy

Every screen has title, one-line description, primary action, and a content region. Lists provide search, filter, sort, page size (10/25/50/100), density, column selection where applicable, selection toolbar, Export CSV, and Print. Empty states include a 64px icon, purpose sentence, and primary action; filtered empty states include Clear filters. Loading uses skeleton rows/cards. Errors identify the failed operation and provide Retry.

Rows open detail on click/Enter; row menus expose entity-specific Edit and Archive (and workflow actions only when valid). New records must behave identically to sample records. Archive uses an 8-second Undo snackbar; archived records are available under an Archived filter.

### 2.2 Forms and dialogs

Use the same form for create/edit. Validate on blur and submit; on failed submit focus the first invalid field. Required labels remain visible, helper text explains formats, and errors are adjacent to fields. Dirty Cancel asks for confirmation. Save shows a snackbar with View; Save and add another is used for repeated employee/candidate entry. Dialogs trap focus, close on Escape where safe, restore focus to the opener, and become full-screen sheets on xs.

Destructive actions are text buttons in error color and require confirmation. State-invalid actions are disabled with helper text explaining the exact prerequisite. Conflict responses offer Reload latest and Review differences.

### 2.3 Feedback, notifications, and audit

All successful writes update visible content and generate one audit record. Show a concise snackbar with a View action; use an inline banner for durable warnings (local-only security, unsaved work, backup reminder). Approval/request events add notification entries with deep links. Activity tabs show Notes, Activity log, Attachments, and Tasks where the record supports them.

### 2.4 Accessibility and responsive behavior

- WCAG AA contrast; never convey state by color alone (text/icon/status label accompanies color).
- All controls have accessible names; decorative icons are hidden; informative icons have labels.
- Minimum 48px touch targets; keyboard order follows visual order; visible 2px focus ring with offset.
- Tables become stacked lists on xs with the same fields and row actions.
- Drawers, dialogs, menus, tabs, and popovers have keyboard semantics and focus management.
- Respect reduced motion by removing ripples/transforms.
- Dates are shown in the workspace format, stored/displayed with explicit calendar semantics; time zone is shown where relevant.

## 3. Workflow specifications

### 3.1 Home and Tasks

`/home` opens with greeting/persona, today’s attendance status, pending approvals (role-filtered), leave balance summary, timesheet status, upcoming onboarding tasks, and recent activity. Each card is clickable to its real destination. Quick actions: Request time off, Check in/out, Add employee (permission-aware), Add candidate.

`/tasks` has tabs **Assigned to me**, **Due soon**, **Completed**. Each row shows task, related record, assignee, due date, and status. Complete opens a small outcome dialog when an outcome is meaningful; otherwise persists completion directly. Reopen is available only for completed tasks and shows a reason. Filters and search persist in URL. Empty states distinguish “No tasks assigned” from “No results for these filters.”

### 3.2 People

`/people` directory supports search over name, role, team, and location. The header includes New employee; list rows show avatar/initials, name, job title, department, location, status, and manager. Detail header shows identity, status, key facts, Edit and Archive, with tabs Overview, Activity, Attachments, Tasks. Create/edit fields: name, work email, phone, title, department, location, manager, start date, employment status. Save updates the directory, creates audit entry, and links the employee as the source identity for attendance/timesheets/onboarding. Archive confirmation lists dependent records and explains that history remains.

### 3.3 Time off and Requests

`/time-off` combines balance cards, month calendar, and My requests list. Request form fields: leave type, start/end date, partial-day option, reason, attachment (optional). Inline validation rejects invalid ranges, overlap, insufficient balance, and non-working/holiday combinations with actionable text. Submit changes request status to Pending and creates an approval notification.

`/requests` tabs: To review, Submitted by me, All (only authorized persona), Completed. Rows show subject, requester, date/amount, age, due, and step chips. Detail drawer (full page on xs) includes policy chain, comments, balance after approval, and team calendar context. Approve persists final effects (balance/calendar/status), Reject and Return require a comment, and forbidden/self-approval controls are not rendered. Bulk actions apply one confirmation/comment to selected valid rows and report skipped invalid rows.

### 3.4 Attendance

`/attendance` prioritizes today’s status card: Not checked in, Checked in with start time, or Checked out with duration. Primary action changes between Check in and Check out; after checkout it is disabled with “Today’s attendance is closed.” History supports date range, employee (manager/HR), status, and missing checkout filters. Regularization opens a form with date, corrected times, reason, and optional evidence; it shows Pending/Approved/Rejected and approval route. Missing checkout is explicit, never silently inferred. Check-in/out persists and survives reload.

### 3.5 Timesheets

`/timesheets` shows current week selector, employee/project context, daily rows, total hours, and status Draft/Submitted/Approved/Locked. Users add/edit hours and notes while Draft; Submit opens a summary confirmation and locks editing pending decision. Managers see Approve/Return with required comment. Locked controls explain “This week is approved; ask your manager to reopen it.” Week navigation updates URL and respects Monday workspace setting. Approved totals feed Home status only; no payroll placeholder is shown.

### 3.6 Recruitment and Careers

`/recruitment` has Jobs and Candidates tabs. Jobs list shows title, department, location, status, and candidate count. Candidate pipeline uses ordered stages Applied → Screening → Interview → Offer → Hired/Rejected; stage movement is only available to the next valid transition and shows a confirmation with resulting notification/outbox effect. New candidate and public/local Apply forms accept name, email, phone, job, resume/file (if supported), and source; arbitrary newly entered candidates appear immediately.

Candidate detail includes contact, job, stage, timeline/activity, and actions: Advance, Reject, Schedule interview, Create offer/outbox item, Hire. Rejection requires a reason. Hire confirmation creates an employee/pending-hire record and onboarding tasks, then links to `/onboarding`. Candidate status and employee identity remain distinct and visible.

### 3.7 Onboarding

`/onboarding` lists pending hires/new joiners with progress, start date, manager, and overdue count. Detail shows ordered task checklist grouped by pre-start, first day, and first week. Tasks have assignee, due date, status, and completion note. Completing a task persists and updates progress; overdue is a labeled state, not just red. A newly hired candidate always gets actionable tasks. Empty state directs HR to Recruitment rather than offering an inert “Add” control.

## 4. Visual language and component inventory

Use bundled assets only; no runtime network fonts/icons. Preserve Material 2 tokens and 8px grid from the spec: primary/secondary/error surfaces, 4px component radius, card 1dp, app bar 4dp, dialog 24dp. Use one consistent component per job:

- App bar, navigation drawer, bottom navigation, breadcrumbs.
- Page header, cards, status chips, avatars, skeletons, empty/error states.
- Text/select/date fields, checkbox/switch, segmented tabs.
- Data table/list, filter builder, pagination, selection toolbar.
- Dialog, bottom sheet, popover/menu, snackbar, tooltip, confirmation.
- Activity panel, timeline, calendar, pipeline board, checklist, attachment picker.

Primary action is contained/raised once per region; secondary actions are outlined/text; destructive actions are error text. On xs/sm, the module’s primary create action is one FAB above bottom navigation. Do not introduce a control without specifying its observable outcome.

## 5. Copy and refusal rules

Use direct, human wording: “Request time off”, “Approve request”, “Return for changes”, “Archive employee”, “Check in”. Avoid “Coming soon”, “Demo”, “Placeholder”, and unexplained technical errors. Local-only limitations are explicit: “Saved on this device”, “Email is prepared in Outbox; nothing is sent from this browser.” If a workflow is unavailable, omit its navigation/control; if a record state blocks an action, disable it with the reason and next step.

## 6. Implementation handoff checklist

- Implement route allow-list and redirect unknown/deferred paths to `/not-found`.
- Build shared shell/components before feature-specific variants; keep feature/API boundary from the architect artifact.
- Ensure all list query state is URL-backed and all writes produce visible state, audit, and relevant notification.
- Verify new records work through every applicable action, not only sample records.
- Exercise keyboard and xs layouts for each route; verify dialogs and drawers restore focus.
- Keep browser-only security statement visible in setup/settings/help content.

## Test Results

- Command: Documentation-only UX design task; no production test command applicable.
- Passed: N/A
- Failed: 0
- Skipped: `npm run lint`, `npm run build` (owned by implementation/validation roles; no source was changed).

## Findings

- HIGH: None.
- CRITICAL: None.
- Remaining product gap: all deferred modules (payroll, expenses, documents, performance, offboarding, learning, engagement, help desk, assets, calendar, reports, automations) remain intentionally absent until complete workflows exist.
