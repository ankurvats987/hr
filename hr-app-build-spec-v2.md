# HR App: Build Specification, version 2

Audience: an AI coding agent that will build and test this application end to end without asking questions.

Supersedes: the earlier demo specification and the current demo code base. Where this file and the old code disagree, this file wins.

Reference products: Odoo (Employees, Time Off, Attendances, Planning, Recruitment, Appraisals, Payroll, Expenses, Referral, Skills, Contracts) and Zoho People (employee database, leave policies, attendance and shifts, timesheets, onboarding, performance, case management, forms, letters, workflows), plus the modules Zoho splits into Zoho Recruit, Zoho Payroll and Zoho Expense. Twenty (open source CRM) contributes one idea: custom fields stored as metadata. Build everything from this document. Do not copy code from any of these products.

---

## 0. Read this first

### 0.1 What this document changes

The first build was a browser demo: one `App.jsx`, one `localStorage` JSON blob, a persona switcher instead of login, and a shared "feature page" that showed seeded rows with Duplicate and Remove from view actions. That is not an HR application.

This document defines a complete local-first HR application:

- Every module is real: people, leave, attendance, rosters, timesheets, recruitment, onboarding, offboarding, documents and e-signature, performance, payroll, expenses, assets, learning, engagement, help desk, reports.
- Every button, link, menu item, switch and field does something real and observable (section 2).
- All data lives in the browser (IndexedDB). There is no server, no network call and no third-party service.
- The UI never touches storage directly. It calls an API layer whose local implementation can later be replaced by an HTTP client without rewriting screens (sections 4 and 13).
- The look is Material Design 2, the Android Material style from roughly 2014 to 2021: colored top app bar, raised buttons with uppercase labels, floating action button, cards with shadows, underlined or filled text fields, Roboto, Material Icons (section 3).

### 0.2 What to do with the existing code

Treat the existing code as a throwaway prototype. Rebuild in TypeScript with the structure in section 4. You may reuse: the sample people names, the persona list as a starting point for sample accounts, and any guide copy that is still accurate. Delete and do not port:

| Existing behavior | Why it is wrong | Required replacement |
| --- | --- | --- |
| One `FeaturePage` component with seeded rows for Org chart, Offboarding, Reviews, Documents, Announcements, Calendar, Help desk, Reports, Payroll inputs, Automations, Audit log, Settings | These pages have no domain logic | A dedicated module for each (section 6) |
| Row menu with Open details, Duplicate, Remove from view | Not HR operations; Remove from view does not delete anything | Per entity actions defined in each module, plus standard record behaviors (2.3) |
| Careers form that creates a fixed "Demo candidate" | No real application | Real form, resume upload, screening questions, reference number (H6) |
| Hiring stage advance by clicking a card | No interviews, scorecards, offers or hire conversion | Full recruitment module (H6) |
| Time off calendar is a hard-coded March grid | Not data driven | Real month, week and agenda views from data (H3, H18) |
| Documents without upload or signatures | Not functional | Real files, templates, PDF generation, e-signature with hash (H8) |
| Reports are seeded rows, payroll inputs only open or lock a row | Not computed | Computed reports and a real payroll module (H10, H19) |
| Automations only toggle on and off | No engine | Trigger, condition, action engine with run log (P11) |
| Settings are seeded rows | They change nothing | Settings that change behavior (P3) |
| Persona switch acts as login | No security model | Real sign-in, users, roles (P2) |
| All state in one `localStorage` key | 5 MB limit, no files, no queries | IndexedDB tables behind the API layer (section 4) |
| Navigation by page state | No URLs, no deep links | Router with real URLs |
| Guide step "Mark step done" button | Manual | Steps complete from real events (section 7) |

### 0.3 Non-negotiables

1. Every control works (section 2). A control that cannot work yet is not rendered.
2. No placeholders: no "coming soon", no lorem ipsum, no fake data outside the optional sample workspace. A module that is not finished is absent from navigation, routes and settings.
3. All data persists across reloads and survives app updates through versioned migrations.
4. No network requests at runtime. Fonts, icons and libraries are bundled.
5. Screens call only the API layer (section 4.3). Business rules live in pure engine functions and the local services, not in components.
6. Permissions are enforced in the API layer, not only by hiding buttons.
7. Every write creates an audit entry.
8. The look follows section 3 exactly. No gradients, glass effects, emoji, decorative illustrations, marketing sections or invented brand colors.
9. Accessible (WCAG 2.2 AA) and responsive from 360px to 1920px wide.
10. The tests in section 10 pass, including the control crawler.

### 0.4 How to work

- Read the whole file first. Build in the order of section 11. Each milestone must be complete and shippable before the next one starts.
- Every decision this file leaves open: choose the simplest option that satisfies section 3 and section 2, and record it as one line in `DECISIONS.md`.
- Do not ask the user questions. Do not reduce scope silently: if you must cut something, remove its navigation entry and write the cut in `DECISIONS.md`.
- Copy rules (3.12) apply to every visible string and to this repository's documentation.

---

## 1. Product definition

**Name:** HR App. The company name comes from setup. The sample workspace company is Kestrel Works, a 48-person product studio with offices in Hyderabad, Bengaluru and Remote.

**Users:** employees, managers, HR officers and administrators, payroll administrators, recruiters, hiring managers, finance approvers, internal auditors (read only), new joiners before their start date (restricted access), and candidates (public careers pages, no account).

**Local-first:** one browser profile holds one workspace. The app is an installable PWA and works offline. Data export and import (backup) is a first-class feature (P7).

**Regional defaults (editable at setup):** currency INR, time zone Asia/Kolkata, week starts Monday, date format `12 Mar 2026`, time format 24-hour, fiscal year starts 1 April, number grouping `en-IN`. Statutory defaults target India (PF, ESI, professional tax, TDS) and are configuration tables, not hard-coded logic (H10).

**Security statement (shown on Settings > Security and in README):** sign-in protects against casual access on a shared device. It does not protect against someone who can read the browser profile, because data is stored locally. Backups can be encrypted with a passphrase. A real backend must enforce access in production.

**Success scenario (the whole product in 15 minutes):**
1. Create a workspace, add departments and locations, import 20 employees from CSV, create their accounts.
2. Define leave types and a holiday calendar.
3. An employee requests leave; the manager approves; the balance and calendar change.
4. HR runs payroll for the month and downloads a payslip PDF; an approved expense claim appears in it.
5. A candidate applies on the careers page; HR schedules an interview, scores it, sends an offer, hires; onboarding tasks appear for the new joiner.
6. HR runs an exit, produces the full and final summary and the relieving letter.

---

## 2. The control contract (every button works)

### 2.1 Rule

A control is anything a user can click, tap, type into, toggle or choose. Every control must produce at least one of these observable outcomes:

| Code | Outcome |
| --- | --- |
| O1 | A persisted change: a database write, an audit entry, and a visible result (updated list, changed status, snackbar with Undo or View). |
| O2 | Navigation to a real route that shows real content. |
| O3 | A dialog, sheet, menu or popover opens with real content and working actions. |
| O4 | A downloaded or printed file generated from live data (CSV, PDF, ICS, backup). |
| O5 | A change in what is displayed (filter, sort, search, group, tab, density, theme, expand), kept in the URL or in a stored user preference. |
| O6 | An explained refusal: the control is disabled with a tooltip or helper text that states the exact reason and what to do next. |

### 2.2 Banned patterns

- A handler that only shows a snackbar or toast.
- A handler that changes React state without persisting it (unless it is pure view state, O5).
- `onClick={() => {}}`, `href="#"`, a button with no handler, visible text such as "Coming soon", "Not implemented", "Placeholder", "TODO", "Demo only".
- Actions that work only on seeded rows. Every action must work on any record, including records the user just created.
- One generic row menu reused by every entity. Each entity defines its own actions.
- A disabled control with no stated reason.
- A success message with no state change behind it.
- Settings for capabilities that do not exist (for example an SMTP form when nothing can send mail).
- Hard-coded option lists that should come from data (departments, leave types, projects, approvers, roles).
- Navigation items, tabs or menu entries for unfinished modules.

### 2.3 Standard record behaviors (SRB)

Every module uses these. Module sections only list what differs.

**SRB1 Create.** "New <thing>" opens a page form at `/<module>/new` when the entity has more than five fields, otherwise a dialog (full-screen on xs). Validation uses zod on blur and on submit, with inline errors; focus moves to the first invalid field after a failed submit. Buttons: Save; Save and add another (only where repeated entry is normal); Cancel (asks to discard only if the form is dirty). After saving: snackbar with a View action, and the record appears in its list.

**SRB2 Edit.** Edit on the detail page and in the row menu opens the same form prefilled. Writes use the record `version` for optimistic locking. On conflict a dialog says "This record changed since you opened it" with Reload latest, and Review differences (a field by field diff where the user picks which value to keep).

**SRB3 Archive, restore, delete.** Removal means Archive (sets `archivedAt`) with an Undo snackbar for 8 seconds. Archived records disappear from lists and dropdowns, appear under the Archived filter, and can be restored. Permanent delete exists only for records with no dependents, only from the Archived view, only with the `<resource>.purge` permission, and requires typing the record name. A record with dependents (a department with employees, an employee with history) can only be archived, and the dialog lists the blocking dependents.

**SRB4 Lists.** Every list has: text search; a filter builder (field, operator, value, several filters combined with AND); saved views (name, filters, sort, columns; private or shared); multi-column sort; column chooser; density toggle (comfortable 52px rows, compact 40px rows); row selection with a contextual toolbar and bulk actions relevant to the entity (at least Export selected, and Archive selected where permitted); page size 10, 25, 50, 100; Export CSV (all rows matching the current view, visible columns, permission filtered); Print. Search, filters, sort and page live in the URL query so views are linkable and the back button works. On xs the table becomes a list (3.10).

**SRB5 Detail pages.** Header with title, status chip, key facts and primary actions; tabs stored in the URL (`?tab=`); breadcrumbs; Previous and Next arrows through the current list result; Copy link; overflow menu with entity actions; the Activity panel (SRB7).

**SRB6 Attachments.** Any record can hold attachments. Maximum 10 MB per file. Allowed: PDF, PNG, JPG, WEBP, DOCX, XLSX, CSV, TXT. Image and PDF preview, download, delete by uploader or HR, counted in the storage meter. Rejected files show the reason inline.

**SRB7 Activity panel (the Odoo chatter).** Tabs: Notes, Activity log, Attachments, Tasks. Log a note (visible to everyone who can open the record). Comment with `@mention` (creates a notification for that person). Schedule an activity: a to-do with a type (call, email, meeting, review, upload, custom), assignee, due date and note; it appears in the assignee's Tasks page and calendar and is completed with an outcome note. System messages record state changes with who and when.

**SRB8 Import and export.** Entities that HR loads in volume offer Import: download the template, upload a CSV, map columns, see a preview with row level validation, import the valid rows, and download an error file for rejected rows with reasons. Each import is one audited batch and can be rolled back within 30 minutes by batch id.

**SRB9 History.** Every record shows its audit trail (who, when, field, old value, new value) to roles with `audit.read`, and to the record owner for non-sensitive fields.

**SRB10 Empty, loading, error states.** Empty: icon, one sentence explaining what the list is for, the primary action; when filtered, "No results for these filters" with Clear filters. Loading: skeleton rows. Error: what failed and a Retry button.

**SRB11 Permission aware.** Controls a user can never use are not rendered. Controls unavailable because of state are disabled with a reason (O6).

**SRB12 Notifications.** Assigning, mentioning, requesting, deciding, and due-date events create in-app notifications according to the user's preferences (P5).

### 2.4 Enforcement

1. `scripts/check-controls.mjs` runs in `npm run check` and fails on the banned patterns in 2.2 found in `src/`.
2. `tests/e2e/control-crawler.spec.ts`: for each route and each system role, with the sample workspace loaded, enumerate every visible control (`button`, `a[href]`, `[role=button|menuitem|tab|switch|checkbox|radio|option]`, `input`, `select`, `textarea`), activate each one from a clean snapshot (restore the database snapshot after any control that writes), and assert that one of O1 to O6 happened (URL changed, a dialog or menu appeared, an aria state changed, the test hook `window.__apiLog` recorded a write, a download started, the list content changed, or the control is disabled with a reason). Text inputs are filled with a valid value and committed. Destructive confirmations are accepted. A failure prints the route, role and control label.
3. The crawler writes `docs/CONTROLS.md` (route, role, control label, outcome). Commit it. A diff shows added or removed controls in review.
4. Each module in section 6 ends with "Done when" criteria; write each as an automated test.

---

## 3. Design system: Material Design 2 (Android Material)

Follow the Material Design 2 guidelines as used on Android 5 to 11. Implement tokens as CSS custom properties in `src/design/tokens.css`. Light theme is default; dark theme applies with `data-theme="dark"` on `<html>`. Initial theme follows `prefers-color-scheme`; the user can override it in Settings > Appearance and the choice persists. No hex value appears outside `tokens.css`.

### 3.1 Color tokens

**Light**

| Token | Value | Use |
| --- | --- | --- |
| `--md-primary` | #3F51B5 | App bar, contained buttons, links, selected controls, active indicators |
| `--md-primary-dark` | #303F9F | Browser theme color, drawer header strip, pressed primary |
| `--md-primary-light` | #C5CAE9 | Selected row and selected list item backgrounds at 40 percent, focus halos |
| `--md-on-primary` | #FFFFFF | Content on primary |
| `--md-accent` | #FF4081 | Floating action button, notification badge, snackbar action label. Nothing else. |
| `--md-on-accent` | #FFFFFF | Content on accent |
| `--md-bg` | #FAFAFA | Page background |
| `--md-surface` | #FFFFFF | Cards, dialogs, menus, drawer, table |
| `--md-text-high` | rgba(0,0,0,0.87) | Primary text |
| `--md-text-medium` | rgba(0,0,0,0.60) | Secondary text, icons |
| `--md-text-disabled` | rgba(0,0,0,0.38) | Disabled text, placeholders |
| `--md-divider` | rgba(0,0,0,0.12) | Dividers, borders |
| `--md-error` | #D32F2F | Errors, destructive text buttons |
| `--md-success` | #388E3C | Success icons |
| `--md-warning` | #F57C00 | Warning icons |
| `--md-info` | #1976D2 | Information icons |

Status chip tints (background / text), light: success #E8F5E9 / #1B5E20, warning #FFF3E0 / #BF360C, error #FFEBEE / #B71C1C, info #E3F2FD / #0D47A1, neutral #EEEEEE / #424242.

**Dark** (Material Design 2 dark theme)

| Token | Value |
| --- | --- |
| `--md-primary` | #9FA8DA |
| `--md-primary-dark` | #7986CB |
| `--md-primary-light` | rgba(159,168,218,0.24) |
| `--md-on-primary` | rgba(0,0,0,0.87) |
| `--md-accent` | #FF80AB |
| `--md-bg` | #121212 |
| `--md-surface` | #1E1E1E |
| `--md-text-high` | rgba(255,255,255,0.87) |
| `--md-text-medium` | rgba(255,255,255,0.60) |
| `--md-text-disabled` | rgba(255,255,255,0.38) |
| `--md-divider` | rgba(255,255,255,0.12) |
| `--md-error` | #EF9A9A |
| `--md-success` | #A5D6A7 |
| `--md-warning` | #FFCC80 |
| `--md-info` | #90CAF9 |

Dark surfaces by elevation (replace shadows with lighter surface): 1dp #1E1E1E, 2dp #222222, 3dp #242424, 4dp #272727, 6dp #2C2C2C, 8dp #2E2E2E, 12dp #333333, 16dp #353535, 24dp #383838. In dark theme the top app bar uses the 4dp surface, not the primary color.

Dark status chips: background is the status color at 16 percent over the surface; text: success #A5D6A7, warning #FFCC80, error #EF9A9A, info #90CAF9, neutral #E0E0E0.

Color rules: large areas use only `bg`, `surface`, and `primary` (app bar). Charts use `primary` then these in order: #5C6BC0 (indigo 400), #26A69A (teal 400), #FFA726 (orange 400), #78909C (blue grey 400), #8D6E63 (brown 400). Never rely on color alone: every status chip has text, every chart has labels and a table alternative.

### 3.2 Typography

Typeface Roboto, bundled (`@fontsource/roboto` weights 300, 400, 500, 700). Material Design 2 type scale:

| Style | Size (px) | Weight | Letter spacing (px) | Case | Use |
| --- | --- | --- | --- | --- | --- |
| H1 | 96 | 300 | -1.5 | none | Not used in the app |
| H2 | 60 | 300 | -0.5 | none | Not used in the app |
| H3 | 48 | 400 | 0 | none | Not used in the app |
| H4 | 34 | 400 | 0.25 | none | Large numbers on dashboard cards |
| H5 | 24 | 400 | 0 | none | Page titles on md and larger |
| H6 | 20 | 500 | 0.15 | none | App bar title, dialog title, card title |
| Subtitle 1 | 16 | 400 | 0.15 | none | List primary text, form section titles |
| Subtitle 2 | 14 | 500 | 0.1 | none | Table headers, list subheaders |
| Body 1 | 16 | 400 | 0.5 | none | Paragraphs, form input text |
| Body 2 | 14 | 400 | 0.25 | none | Default UI text, table cells |
| Button | 14 | 500 | 1.25 | UPPERCASE | Buttons, tabs |
| Caption | 12 | 400 | 0.4 | none | Helper text, timestamps |
| Overline | 10 | 400 | 1.5 | UPPERCASE | Section labels in the drawer |

Line heights: 1.5 for body styles, 1.2 for H4 to H6. Use `font-variant-numeric: tabular-nums` in tables, timers and money. Primary text uses `--md-text-high`; secondary text `--md-text-medium`.

### 3.3 Elevation

Define `--md-elev-1`, `-2`, `-3`, `-4`, `-6`, `-8`, `-12`, `-16`, `-24` as these box shadows:

| Level | box-shadow |
| --- | --- |
| 1dp | 0 1px 3px rgba(0,0,0,.2), 0 1px 1px rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12) |
| 2dp | 0 1px 5px rgba(0,0,0,.2), 0 2px 2px rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.12) |
| 3dp | 0 1px 8px rgba(0,0,0,.2), 0 3px 4px rgba(0,0,0,.14), 0 3px 3px -2px rgba(0,0,0,.12) |
| 4dp | 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px rgba(0,0,0,.14), 0 1px 10px rgba(0,0,0,.12) |
| 6dp | 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px rgba(0,0,0,.14), 0 1px 18px rgba(0,0,0,.12) |
| 8dp | 0 5px 5px -3px rgba(0,0,0,.2), 0 8px 10px 1px rgba(0,0,0,.14), 0 3px 14px 2px rgba(0,0,0,.12) |
| 12dp | 0 7px 8px -4px rgba(0,0,0,.2), 0 12px 17px 2px rgba(0,0,0,.14), 0 5px 22px 4px rgba(0,0,0,.12) |
| 16dp | 0 8px 10px -5px rgba(0,0,0,.2), 0 16px 24px 2px rgba(0,0,0,.14), 0 6px 30px 5px rgba(0,0,0,.12) |
| 24dp | 0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12) |

Resting elevations: card 1, raised button 2 (pressed 8), FAB 6 (pressed 12), top app bar 4, bottom navigation 8, menu 8, navigation drawer modal 16 (permanent drawer 0 with a 1px divider on its right), snackbar 6, dialog 24, bottom sheet 16, picker 24, tooltip 0. In dark theme use the surface colors above and drop the shadows to the 25 percent strength.

### 3.4 Shape

Cards, buttons, text fields (top corners), menus, dialogs, snackbars, tooltips: 4px radius. Chips and status chips: fully rounded (height / 2). FAB, avatars, switches, radio buttons: circle. Bottom sheets and drawers: 0 radius. Tables: 4px radius on the enclosing card only.

### 3.5 Spacing and layout

- 8px baseline grid. 4px for icon to text gaps. 48px minimum touch target for every control (extend the hit area when the visual is smaller).
- Breakpoints: xs below 600, sm 600 to 1023, md 1024 to 1439, lg 1440 and above.
- Page margins: 16px on xs, 24px on sm and larger. Content max width 1280px, centered, on lg.
- Grid: 4 columns on xs, 8 on sm, 12 on md and lg, 16px gutters (24px on md and lg).
- App bar height: 56px on xs, 64px on sm and larger.
- Navigation: xs uses a bottom navigation bar (5 destinations: Home, Time off, Attendance, Requests, More) and a modal navigation drawer opened by the menu icon or by More. sm uses a modal drawer from the menu icon. md and lg use a permanent drawer, 256px wide, collapsible to a 72px icon-only mini variant (the choice persists).
- Floating action button: xs and sm only, bottom right, 16px from the edges (above the bottom navigation bar on xs), one per screen, for that screen's primary create action. On md and lg the same action is a contained button in the page header; no FAB.
- Page header on every screen: title (H5 on sm and larger; the H6 app bar title on xs), a one line description in Body 2 secondary, and primary actions aligned right.
- Cards in a grid use 16px gaps (24px on md and lg).

### 3.6 Interaction states

State overlays use the content color at these opacities: hover 4 percent, focus 12 percent, selected 8 percent, activated 12 percent, pressed 12 percent, dragged 8 percent. Disabled: content at 38 percent opacity, contained button background at 12 percent black. Focus indicator: 2px outline in `--md-primary` with 2px offset on keyboard focus only (`:focus-visible`). Ripple on press for buttons, list items, tabs and cards that are clickable: circular ripple expanding from the touch point, 300ms standard curve, color of the content at 12 percent. Respect `prefers-reduced-motion` by removing ripples and transforms and setting durations to 1ms.

### 3.7 Motion

Easing: standard `cubic-bezier(0.4, 0, 0.2, 1)`, deceleration `cubic-bezier(0, 0, 0.2, 1)`, acceleration `cubic-bezier(0.4, 0, 1, 1)`. Durations: simple state change 100ms, menus and tooltips 120ms, entering elements 225ms, leaving elements 195ms, dialogs enter 225ms leave 195ms, drawer 250ms, page change 150ms fade. No other animation, no parallax, no animated backgrounds.

### 3.8 Icons

Use the classic filled Material Icons font (npm `material-icons`, bundled), 24px by default, 18px inside chips and dense lists, 64px in empty states. Use a name only if it exists in the package; a unit test validates every icon name used in `src/` against the package codepoints file. Decorative icons have `aria-hidden="true"`; informative ones have `aria-label`. No emoji and no text characters used as icons.

Navigation icons: home (Home), person (My profile), beach_access (Time off), fingerprint (Attendance), access_time (Timesheets), receipt (Expenses), payment (Payslips), assignment_turned_in (Tasks), inbox (Requests), people (People), account_tree (Org chart), date_range (Roster), event (Calendar), business_center (Recruitment), playlist_add_check (Onboarding), exit_to_app (Offboarding), trending_up (Performance), school (Learning), description (Documents), campaign (Engage), support_agent (Help desk), devices (Assets), account_balance_wallet (Payroll), bar_chart (Reports), flash_on (Automations), history (Audit log), settings (Settings), help_outline (Help).

### 3.9 Components

Build each in `src/ui/<Name>/` with a CSS Module, a test, and an entry on the `/_kit` page (development only) that shows every variant and state. Use Radix UI primitives for behavior and accessibility (dialog, dropdown menu, popover, tooltip, tabs, radio group, checkbox, switch) and style them yourself; do not use a styled component library.

**Top app bar.** Primary color (dark theme: 4dp surface), white title in H6, 4dp elevation, height per 3.5. Left: menu icon (xs, sm), back arrow (detail pages and forms), or nothing (md and lg with a permanent drawer). Right: up to three icon actions plus an overflow menu: search (opens the command palette, P6), notifications (bell with an accent badge), help (page guide), and the account avatar (menu: profile, theme, sign out). Contextual mode: when table rows are selected the bar turns light grey (#616161 text on #EEEEEE in light theme) showing "N selected" and the bulk actions, with a close icon to clear the selection. Search mode: an expanded field inside the bar.

**Navigation drawer.** Header strip (company name in H6, signed in user, role). Groups with Overline labels. Items are 48px high, icon at 16px from the left, label Subtitle 2; the active item uses primary text and icon on `primary-light` at 40 percent; sub-items are indented 72px. A badge shows pending counts (Requests, Tasks).

**Bottom navigation.** 56px, 5 destinations, label Caption, active item uses primary color, 8dp elevation.

**Tabs.** Fixed or scrollable, 48px high, label in Button style, active label and 2px indicator in primary (white on a primary app bar), inactive 60 percent. Tabs sync with the URL.

**Buttons.** Height 36px, minimum width 64px, 4px radius, Button typography (uppercase). Contained: primary background, on-primary text, 2dp elevation; one per view region. Outlined: transparent, 1px divider border, primary text. Text: primary text, 8px side padding. Destructive actions use a Text button in `--md-error`; the final confirm button inside a confirmation dialog is also a Text button in `--md-error`. Never a filled red button elsewhere. Icon button: 48px target, 24px icon, medium emphasis, hover overlay circle. Toggle button groups for view switches. Loading state: the label is replaced by a 18px circular progress and the button is disabled.

**Floating action button.** 56px circle, accent background, white icon, 6dp elevation; extended FAB 48px high pill with icon and label. Mini FAB 40px for secondary actions in speed dials (not used unless needed).

**Cards.** 4px radius, 1dp elevation, 16px padding. Header: title in H6, optional subtitle in Body 2 secondary, optional trailing icon button. Actions row at the bottom with Text buttons, 8px padding. Clickable cards ripple and are anchors.

**Lists.** Single line 48px (56px with avatar or icon), two line 64px (72px with avatar), three line 88px. Leading avatar 40px or icon 24px at 16px inset, trailing text or icon or switch. Subheaders in Subtitle 2 secondary; dividers 1px, inset 72px when an avatar leads. Swipe actions are not used.

**Text fields.** One style, the Material Design 2 filled field: 56px high, 4px top corners, background rgba(0,0,0,0.04) (dark rgba(255,255,255,0.07)), 1px bottom line rgba(0,0,0,0.42) that becomes 2px primary on focus and 2px error when invalid, floating label (Body 1 at rest, Caption when floated), helper or error text in Caption under the field, optional leading and trailing icons, character counter where there is a maximum. Textareas auto-grow to 8 lines then scroll. Required fields add "Required" in the helper text, not only an asterisk. Select: field with a dropdown menu (a native select on xs). Autocomplete: filters as you type, can load results from the API, highlights the match, supports multi-select as input chips. Date field: text entry with a calendar icon opening a Material Design 2 date picker dialog (large selected date header, month grid, OK and Cancel text buttons). Time field: native time input in the same style. Money field: right aligned, prefix symbol, grouping on blur. Password field has a show and hide icon.

**Selection controls.** Checkbox 18px box with 2px radius in a 48px target, switch with a 36x14 track and 20px thumb (thumb primary when on), radio 20px. Group labels use Subtitle 2.

**Chips.** 32px high. Filter chips (selected: check icon and primary tint), input chips (trailing delete icon), choice chips. Status chips are 24px high, 12px radius, Caption weight 500, using the tint pairs in 3.1.

**Dialogs.** 4px radius, 24dp elevation, 24px padding, width 280 to 560px, scrim rgba(0,0,0,0.32). Title H6, content Body 1 at medium emphasis, actions right aligned Text buttons (Cancel then the confirming action). Forms with more than three fields use a full-screen dialog on xs: app bar with close icon, title and a Save text button. Focus is trapped, Escape closes unless the form is dirty (then it asks to discard).

**Menus.** 4px radius, 8dp elevation, items 48px (32px dense on md and larger), minimum width 112px, keyboard operable (arrows, Home, End, type-ahead, Escape). Context menus use the same component. Row menus (`more_vert`) show the entity's own actions (2.2).

**Snackbar.** Background #323232 (dark theme #E0E0E0 with dark text), white text, 4px radius, 6dp elevation, minimum height 48px, maximum width 568px, bottom left on md and larger and full width on xs above the bottom navigation. One optional action in `--md-accent` (dark: #FF80AB). Auto-dismiss after 5 seconds (8 for Undo). One at a time, queued. Live region `aria-live="polite"`.

**Tooltips.** Background rgba(97,97,97,0.9), white Caption text, 4px radius, 500ms delay on pointer devices, shown on keyboard focus. Required on every icon-only button. Used for disabled reasons (O6).

**Progress.** Linear 4px (determinate and indeterminate), circular 40px with 4px stroke. Always determinate when the value is known.

**Data tables.** Wrapped in a card. Toolbar (56px): title or contextual selection bar, search, filter, column chooser, density, export. Header row 56px, Subtitle 2 secondary, sortable columns show an arrow icon (`arrow_upward`) that rotates and set `aria-sort`. Body rows 52px (compact 40px), Body 2, bottom divider, hover overlay, selected row `primary-light` at 40 percent. First column optional checkbox. Footer 56px: "Rows per page" select, "1 to 10 of 248", previous and next icon buttons. Sticky header and sticky first column on horizontal scroll inside the card only. Tables over 200 visible rows use virtualization. On xs the table becomes a list (two or three line items: primary column as title, key columns as secondary lines, status chip trailing); the page never scrolls horizontally.

**Bottom sheet.** xs only, for filters, sort and menus with many items: 16dp elevation, 0 radius, drag handle optional.

**Steppers** (wizards): horizontal on md and larger, vertical on xs; steps show number, label, optional "Optional"; completed steps show a check.

**Banners.** Surface strip with a leading icon in a tinted circle, text, up to two Text buttons, a dismiss action where dismissible. Used for backup reminders, locked months, sample workspace notice.

**Empty states.** Centered, 64px icon at 38 percent, H6, Body 2 secondary, one contained button.

**Avatars.** 40px circle (32px dense, 96px profile header). Photo if uploaded, otherwise the classic Android letter tile: initials in white on one of these eight backgrounds chosen by hashing the record id: #455A64, #5D4037, #00796B, #303F9F, #7B1FA2, #C2185B, #D84315, #2E7D32.

**Charts.** Recharts styled by tokens: no gradients, no 3D, no animation longer than 300ms, axis text Caption secondary, horizontal gridlines in the divider color, legends as chips, tooltips in the tooltip style. Each chart sits in a card, has a hidden data table for screen readers, and a "Download CSV" icon button.

### 3.10 Responsive behavior

| Pattern | xs | sm | md and lg |
| --- | --- | --- | --- |
| Navigation | Bottom bar plus modal drawer | Modal drawer | Permanent drawer (mini variant optional) |
| Tables | Lists | Tables, horizontal scroll inside the card if needed | Tables |
| Forms | One column, full-screen dialogs for long forms | Two columns | Two or three columns, max width 960px |
| Detail pages | Tabs scroll; activity panel below | Activity panel below | Activity panel as a right column (360px) |
| Create action | FAB | FAB | Contained button in header |
| Filters | Bottom sheet | Dialog | Inline toolbar and filter popover |

### 3.11 Print

`print.css` hides navigation, app bar, FAB and actions, uses white background, black text, 12pt body, and keeps tables from splitting rows across pages. Payslips, letters, ID cards, reports and the org chart have print layouts.

### 3.12 Copy rules (apply to every string and document)

- Plain, direct, sentence case for headings, labels and messages (button labels are uppercase only through CSS). No exclamation marks.
- No em dash and no en dash anywhere. Use commas, colons, periods, parentheses or the word "to".
- Banned words: seamless, seamlessly, powerful, robust, leverage, unlock (as a marketing verb; the Unlock action for locked months, weeks and accounts is fine), supercharge, streamline, effortless, cutting-edge, revolutionary, game-changer, empower, delightful, journey, AI-powered, "in today's fast-paced world".
- Buttons start with a verb: "Request leave", "Approve", "Save changes".
- Dates `12 Mar 2026`, times `09:32`, durations `2 days` or `4.5 hours`, money `₹12,500` via `Intl.NumberFormat('en-IN')`. Time zone is the company time zone for every displayed time.
- Errors say what happened and what to do: "End date is before start date. Choose a date on or after 12 Mar 2026."
- No marketing language, no greetings such as "Welcome back, Isha!" or "Hey there". The Home title is the date and the user's name in Subtitle 1.

### 3.13 Anti-template rules

- No hero sections, feature grids, testimonials, stock illustrations, mascot, gradients, glassmorphism, blurred backgrounds, neon glows, floating decorative shapes, oversized rounded pills, or gradient text.
- Dense, utilitarian screens: tables, forms, lists, calendars and charts with real numbers. Card grids only where cards hold real data (dashboard widgets, leave balances).
- One primary color, one accent (FAB and badge only). Status colors only on status chips and icons.
- Realistic data in the sample workspace: names, titles, dates and amounts that look like a real company, no "John Doe", no round placeholder numbers.
- Consistent alignment and spacing from the 8px grid. Icons from one set. One component for each job (one dialog, one menu, one table).


---

## 4. Architecture (local now, backend later)

### 4.1 Stack

| Concern | Choice |
| --- | --- |
| Language, build | TypeScript (strict), Vite, React 18 |
| Routing | React Router (data router, lazy routes per module) |
| Server state | TanStack Query. Every read is a query, every write is a mutation that invalidates by key. This is intentional: the same hooks work unchanged against a real backend. |
| Tables | TanStack Table, TanStack Virtual for long lists |
| Forms and validation | react-hook-form with zod resolvers. Schemas live in `src/contract/schemas/` and are shared by UI, local services and the future backend. |
| Local database | IndexedDB through Dexie |
| Primitives | Radix UI (behavior only), styling by CSS Modules and `tokens.css` |
| Dates | date-fns and date-fns-tz. All stored timestamps are UTC ISO strings. Calendar dates (birthdays, leave days, holidays) are stored as `YYYY-MM-DD` strings with no time zone. |
| Money | Integer paise. Never floats. Helper `Money` in `src/lib/money.ts` with add, sub, mul by rational, round half up, format. |
| CSV | papaparse |
| PDF | jspdf with jspdf-autotable (payslips, letters, reports, ID cards, certificates) |
| QR | qrcode (ID cards, document verification, asset labels) |
| Zip | fflate (backups, bulk downloads) |
| Rich text | TipTap (document templates, job postings, policies, announcements, knowledge articles) with a minimal toolbar: headings, bold, italic, lists, links, tables, alignment |
| Resume text | pdfjs-dist (PDF text), mammoth (DOCX text), both loaded lazily and bundled, run in a worker |
| Signatures | A bundled handwriting style font (for example Caveat via `@fontsource/caveat`) for typed signatures |
| Charts | recharts |
| Drag and drop | dnd-kit (kanban, reorder, roster) |
| PWA | vite-plugin-pwa (precache the app shell, installable, offline) |
| Tests | Vitest and Testing Library (unit, component), Playwright (end to end, crawler, accessibility with axe) |
| Lint | ESLint with `no-restricted-imports` rules from 4.2, Prettier |

Use no CSS framework, no component library, and no icon font other than `material-icons`. No runtime dependency may make a network request. Add a Playwright test that fails if any request leaves `localhost` during a full run.

### 4.2 Layers and import rules

```
src/
  contract/        zod schemas, TypeScript types, error codes, permission keys, route table of the API. No React, no Dexie.
  api/             the only thing the UI imports for data
    index.ts       chooses an adapter from import.meta.env.VITE_API_MODE ("local" | "http")
    client.ts      typed client: resource methods used by hooks
    adapters/
      local/       Dexie repositories, services, unit of work, engines wiring
      http/        fetch based adapter (built in milestone M19, empty until then; not shipped as dead code, see 4.9)
  engines/         pure functions, no I/O: approvals, workflow, formulas, payroll, leave accrual, roster, tax, search ranking
  features/<module>/   screens, hooks, components for one HR module
  platform/        auth session, permissions, notifications UI, command palette, guidance, settings
  ui/              design system components (3.9)
  design/          tokens.css, typography.css, elevation.css, print.css
  lib/             money, dates, ids, csv, pdf, files, crypto, i18n helpers
  workers/         search index worker, scheduler worker, pdf worker (optional)
```

Import rules enforced by ESLint:
- `features/**` and `platform/**` may import `api/index`, `api/client`, `contract/**`, `engines/**` (for client side previews only), `ui/**`, `lib/**`. They must not import `api/adapters/**`, `dexie`, or call `indexedDB`, `localStorage` (except through `lib/prefs`), or `fetch`.
- `engines/**` may import only `contract/**` and `lib/**`, and has no side effects.
- `api/adapters/local/**` may import `engines/**`, `contract/**`, `lib/**`, `dexie`.
- `ui/**` imports nothing from `features/**`, `platform/**`, `api/**`.

### 4.3 The API layer

The UI talks to a client that looks like a REST API even though the local adapter is plain TypeScript. This is what makes the later backend swap a transport change.

**Resource methods (all return promises):**

| Method | Maps later to |
| --- | --- |
| `list(resource, query)` | `GET /api/v1/<resource>` |
| `get(resource, id)` | `GET /api/v1/<resource>/{id}` |
| `create(resource, body)` | `POST /api/v1/<resource>` |
| `update(resource, id, patch, version)` | `PATCH /api/v1/<resource>/{id}` with `If-Match: version` |
| `action(resource, id, name, payload)` | `POST /api/v1/<resource>/{id}/actions/<name>` |
| `collectionAction(resource, name, payload)` | `POST /api/v1/<resource>/actions/<name>` |
| `remove(resource, id)` | archive: `POST .../actions/archive`; purge: `DELETE` |
| `upload(file, meta)` and `fileUrl(id)` | `POST /api/v1/files`, `GET /api/v1/files/{id}` |
| `report(name, params)` | `GET /api/v1/reports/<name>` |
| `subscribe(resource, handler)` | server sent events later; BroadcastChannel now |

Wrap these in typed hooks per resource (`useEmployees(query)`, `useCreateLeaveRequest()`), written once in `features/<module>/api.ts`. Query keys follow `[resource, 'list', query]`, `[resource, 'detail', id]`, `[resource, 'report', name, params]`. A mutation declares which keys it invalidates; the local adapter also emits a change event so other tabs invalidate the same keys.

**List query contract:**

```ts
type ListQuery = {
  q?: string;                         // text search over searchable fields
  filters?: { field: string; op: 'eq'|'ne'|'in'|'nin'|'lt'|'lte'|'gt'|'gte'|'contains'|'startsWith'|'between'|'isNull'|'notNull'; value?: unknown }[];
  sort?: { field: string; dir: 'asc'|'desc' }[];
  page?: number;                      // 1 based
  pageSize?: number;                  // 10, 25, 50, 100, max 500
  include?: string[];                 // related resources to embed, for example ['department','manager']
  archived?: 'exclude' | 'only' | 'include';  // default exclude
};
type Page<T> = { items: T[]; total: number; page: number; pageSize: number };
```

Filter fields, sortable fields and searchable fields are declared per resource in `contract/resources.ts`; the filter builder UI reads this declaration, so a new field gets filtering for free. The local adapter implements the same query contract over IndexedDB using indexes where possible and in-memory evaluation otherwise (workspaces are small).

**Envelope and errors.** Successful writes return the full updated record with a new `version`. Errors are a single shape:

```ts
type ApiError = {
  code: 'validation' | 'unauthenticated' | 'forbidden' | 'not_found' | 'conflict' | 'rule_violation' | 'locked' | 'quota' | 'unsupported';
  message: string;               // user readable, follows copy rules
  fields?: Record<string,string>; // field path to message, for validation
  details?: unknown;              // for conflict: the latest record; for rule_violation: rule id and data
};
```

The UI maps `validation` to inline field errors, `conflict` to the SRB2 dialog, `forbidden` to a quiet refusal message, `locked` (closed payroll month, locked timesheet) to an explanation with the unlock path, `quota` to the storage banner. The local adapter must throw exactly these errors so the UI never learns which adapter is running.

**Latency.** The local adapter resolves immediately. Do not add artificial delays except in a development toggle (`?latency=300`) used to test loading states.

### 4.4 Local database

Dexie database `hrapp` with versioned schema. One object store per resource (names in 4.4.2), plus system stores.

**4.4.1 Record shape.** Every record has:

```ts
{ id: string;            // ULID (sortable, generated in lib/ids.ts)
  version: number;       // starts at 1, increments on each write
  createdAt: string; createdBy: string;   // UTC ISO, user id
  updatedAt: string; updatedBy: string;
  archivedAt?: string | null; archivedBy?: string | null;
  custom?: Record<string, unknown>;       // custom field values (P9)
  ...domain fields }
```

Foreign keys are ULID strings. No embedded copies of other records except deliberate snapshots (payslip lines, signed documents, offer terms) that must not change when the source changes; snapshots are marked in the module sections.

**4.4.2 Stores.** `employees, departments, jobTitles, locations, legalEntities, costCenters, positions, contracts, emergencyContacts, dependents, bankAccounts, employeeDocuments, skills, employeeSkills, certifications, leaveTypes, leavePolicies, leaveAccrualPlans, leaveBalances, leaveLedger, leaveRequests, holidayCalendars, holidays, shifts, rosterAssignments, shiftSwaps, attendanceEvents, attendanceDays, regularizations, geofences, projects, tasks, timesheets, timesheetEntries, requisitions, jobPostings, candidates, applications, interviews, scorecards, offers, talentPools, referrals, onboardingTemplates, onboardingPlans, onboardingTasks, offboardingCases, offboardingTasks, exitInterviews, documentTemplates, generatedDocuments, signatureRequests, policies, policyAcknowledgements, reviewCycles, reviews, goals, keyResults, feedback, oneOnOnes, competencyModels, succession, courses, enrollments, trainingSessions, announcements, surveys, surveyResponses, recognitions, polls, tickets, ticketMessages, knowledgeArticles, assets, assetAssignments, assetRequests, expenseCategories, expenseClaims, expenseLines, advances, mileageRates, payrollConfigs, salaryStructures, salaryComponents, employeeSalaries, payrollRuns, payslips, payslipLines, loans, reimbursements, taxDeclarations, fnfSettlements, workflows, workflowRuns, approvalPolicies, approvalRequests, approvalSteps, activities, notes, notifications, notificationPrefs, savedViews, customFieldDefs, customFormDefs, users, sessions, roles, auditLog, files, fileBlobs, settings, jobsLog, outbox, imports, counters, searchIndex, meta`.

Do not create a store until the module that owns it is built (section 11). Add indexes for every field used by a declared filter or foreign key, plus compound indexes for the main list sorts.

**4.4.3 Migrations.** `db.version(n).stores({...}).upgrade(tx => ...)`. Every release that changes shape adds a version with an upgrade function and a test that opens a database seeded at version n-1 and asserts the result. Never edit an old version block. The `meta` store holds `schemaVersion`, `workspaceId`, `createdAt`, `lastBackupAt`.

**4.4.4 Counters.** Human readable numbers (employee code `KW-0042`, requisition `REQ-2026-014`, ticket `HD-1031`, expense `EXP-00087`, payroll run `PR-2026-03`) come from the `counters` store, incremented inside the same transaction as the create. Prefix, padding and reset rule (never, yearly, monthly) are configurable in Settings.

**4.4.5 Unit of work.** Every mutation runs inside one Dexie transaction spanning all stores it touches, including `auditLog`, `notifications` and `searchIndex` writes. If any step throws, nothing is written. Services receive a `uow` object with `repo(name)`, `audit(entry)`, `notify(n)`, `counter(name)`, `now()`, `actor()`. Side effects that are not transactional (downloads, printing) happen in the UI after the mutation resolves.

**4.4.6 Optimistic locking.** `update` compares `version`; mismatch throws `conflict` with the latest record in `details`.

**4.4.7 Multi-tab.** Use a `BroadcastChannel('hrapp')`. After each committed write, post `{resource, ids, kind}`. Other tabs invalidate matching query keys. Sign-out, role changes and workspace reset broadcast too and force every tab to re-authenticate or reload. A Web Lock (`navigator.locks`) ensures only one tab runs the scheduler at a time (P10).

**4.4.8 Storage and quota.** Request persistent storage (`navigator.storage.persist()`) after setup. The Settings > Data page shows `navigator.storage.estimate()`, per-store row counts and the largest files. At 80 percent of quota show a banner with Export and Free space actions (list files by size with delete). A write that fails with `QuotaExceededError` becomes the `quota` error.

**4.4.9 Files.** Metadata in `files`, bytes in `fileBlobs` (Blob values keyed by file id). Enforce SRB6 limits and a MIME sniff on the first bytes (do not trust the extension). Generate image thumbnails (240px) with canvas at upload. Object URLs are created on demand and revoked on unmount.

### 4.5 Services and engines

Each module has a service in `api/adapters/local/services/<module>.ts` exposing the resource methods and actions listed in its module section. A service does, in this order: authenticate, authorize (P2), validate with the zod schema, apply business rules (engine functions), write, audit, notify, index for search. Rules that more than one module needs live in `engines/`:

| Engine | Pure function surface |
| --- | --- |
| `approvals` | `resolveChain(policy, subject, orgSnapshot) -> Step[]`, `decide(request, step, decision, actor) -> request`, `escalate(request, now) -> request` |
| `workflow` | `evaluate(workflow, event, context) -> Action[]` (P11) |
| `formula` | `parse(text) -> AST`, `evaluate(ast, variables) -> number` for payroll components and report columns; no `eval`, no `Function`; supports numbers, variables, `+ - * / %`, parentheses, `min max round floor ceil abs if(cond,a,b)`, comparisons, `and or not`; division by zero returns an error value that blocks the run |
| `leave` | `accrue(plan, employee, period) -> LedgerEntry[]`, `balance(ledger, asOf)`, `validateRequest(request, balance, rules, holidays, roster) -> Result`, `countDays(range, halfDays, holidays, weekends, rules)` |
| `attendance` | `computeDay(events, shift, rules) -> DayResult` (worked minutes, late, early, overtime, status), including overnight shifts and missing punches |
| `roster` | `validateAssignment(assignment, existing, rules)`, `detectConflicts`, `fairnessReport` |
| `payroll` | `computeEmployee(inputs, config, formulaVars) -> Payslip`, `computeStatutory(config, gross, state) -> Lines`, `tds(regime, declarations, annualProjection) -> monthly`, `fnf(case) -> Settlement` |
| `search` | `tokenize`, `score`, `rank` for the command palette and global search |
| `recurrence` | `expand(rule, from, to)` for repeating shifts, activities, holidays, surveys |

Every engine has table-driven unit tests with edge cases listed in its module section.

### 4.6 Authorization in the API layer

Each service method declares a permission key (for example `leave.request.approve`) and a scope check. The adapter evaluates `can(user, key, record?)` (P2) before any read or write and filters list results by scope (own, team, department, entity, all). List endpoints must never return records the user cannot see; counts must not leak either. The UI uses the same `can` function (exposed as `usePermission`) only to hide or disable controls; the adapter is the authority.

### 4.7 Time and scheduling

All logic takes `now` from a clock injected into the services (`uow.now()`), so tests can control time. The scheduler (P10) runs while the app is open and catches up missed work on open.

### 4.8 Contract tests (the backend insurance)

`tests/contract/` contains a suite that exercises every resource method through the `api` client only, with no knowledge of the adapter: create, list with each filter operator and sort, update with stale version, actions, permission denial for each role, validation errors, archive and restore, file upload, report outputs. It runs against the local adapter in CI now. Later the same suite runs against the HTTP adapter pointed at the real backend. Also add `npm run contract:export`, which writes `contract/openapi.json` generated from the zod schemas and resource declarations (use `zod-to-json-schema` and a small script). A backend team, for example one using FastAPI with PostgreSQL, can generate models and routes from that file.

### 4.9 What not to build

Do not write the HTTP adapter now. Do not add a mock server, MSW handlers, or dead code for it. Keep `VITE_API_MODE=local` as the only mode that ships until M19, where the adapter is built from the exported contract. The seams that matter (4.2 to 4.8) are what make the later work small.

### 4.10 Configuration

`.env.example`: `VITE_API_MODE=local`, `VITE_APP_NAME=HR App`. No secrets exist. Feature flags are not allowed to hide unfinished UI (0.3 rule 2); they are only for development toggles like latency.

### 4.11 Performance budgets

Initial JS under 350 KB gzipped for the shell (code split per module), route change under 100 ms after first load, a 2,000 employee workspace renders the People list in under 200 ms with virtualization, payroll for 500 employees computes in under 5 seconds in a worker and shows progress, search index updates incrementally. Add a Playwright performance test for the People list and payroll.

---

## 5. Platform modules (P1 to P11)

These are built before the HR modules because every HR module depends on them.

### P1. Workspace setup wizard and sign-in

**Purpose.** First run creates a workspace; later runs sign in.

**First run (no workspace in IndexedDB).** A full screen stepper (no navigation chrome):

1. Company: legal name, display name, logo upload (optional, 2 MB), country, currency, time zone, fiscal year start month, date format, week start. Defaults from 1.
2. Administrator: full name, work email, password (strength meter and the rules in P2), confirm password.
3. Structure: add at least one legal entity (prefilled from step 1), at least one location, and any number of departments (chips with Add). Skipping departments is allowed; at least one location and one entity are required.
4. Choose a start: "Start empty" or "Load sample workspace (Kestrel Works)". The sample option states that it adds 48 fictional employees, which can be removed later from Settings > Data > Remove sample data (P7).
5. Review and Create workspace. On success: seed system roles (P2), leave types and a default holiday calendar for the country, default approval policies, default notification preferences, default document templates, payroll config for India (H10) if the country is India, then sign the administrator in and open the Home page with the setup checklist (below).

Each step has Back, Next, and Save progress; closing the tab keeps the draft in IndexedDB.

**Sign-in screen.** Email, password, Sign in. Failed attempts: after 5 consecutive failures for an email, lock that account for 60 seconds, doubling each further failure up to 15 minutes (counted in the `users` record). "Forgot password" opens an HR-assisted flow: the user taps "Ask HR to reset", which creates a Help desk ticket visible to HR (category Access) with no password data; an administrator resets the password from People > Accounts, which sets a one-time temporary password the user must change at next sign-in. The sign-in screen states that no email is sent from this local version.

**Sample workspace accounts.** Only when the sample workspace is loaded, the sign-in screen shows a "Sample accounts" card listing eight accounts with their role and a "Sign in as" button that signs in without a password. The card is hidden and the accounts' passwords are rotated when sample data is removed. The "View as" menu (P2) is separate.

**Setup checklist (Home, administrator only, dismissible once complete).** Items check themselves from real data: company profile complete, org structure added, leave types reviewed, holiday calendar reviewed, employees added (target at least 1 beyond the admin), accounts created, payroll configuration reviewed, first backup exported. Each item links to the page that completes it.

**Controls and outcomes.** All wizard buttons: O1 and O2. Sample accounts buttons: O1 (session) and O2. Ask HR to reset: O1 (ticket).

**Done when.** A new browser profile reaches a working Home page through the wizard in under 3 minutes with sample data; reload keeps the session; wrong passwords lock out as specified; the checklist items tick from data.

### P2. Authentication, users, roles, permissions

**Real local auth.**
- Password rules: at least 10 characters, not equal to the email local part, not in a bundled list of the 1,000 most common passwords, strength meter shown.
- Hashing: PBKDF2-SHA-256 through WebCrypto, 310,000 iterations, 16 byte random salt per user, stored with the iteration count. Passwords never stored or logged in plain text.
- Session: a random 256 bit token stored in the `sessions` store and `sessionStorage`; idle timeout default 30 minutes (configurable 5 to 480); absolute timeout 12 hours. Locking the screen (a menu item) keeps the session but requires the password to continue. Sign out ends the session and clears query caches.
- Optional second factor: TOTP (RFC 6238) implemented with WebCrypto, QR code shown with `qrcode`, 8 single-use recovery codes, required for roles that the administrator marks "MFA required". Include test vectors from RFC 6238 in unit tests.
- Change password: current password, new password, confirm; ends other sessions.
- Active sessions list (device label from user agent, last active) with Sign out for each.

**Users and accounts.** An account links to one employee (or none for external auditors). People > Accounts lists accounts: status (invited, active, locked, disabled), role(s), last sign-in. Actions: Create account (from an employee or standalone), Reset password (temporary password, shown once with Copy), Unlock, Disable, Enable, Change roles, Force sign-out, Require MFA. Creating accounts in bulk: select employees, "Create accounts", choose role, the temporary passwords download as a CSV once (the CSV is the only place they are shown).

**Roles and permissions.**
- Permission keys have the form `<resource>.<action>` (for example `employee.read`, `employee.update`, `leave.request.approve`, `payroll.run.finalize`, `salary.read`, `audit.read`). The full catalogue is in Appendix A and is the single source for the roles UI.
- Scopes: `self`, `reports` (direct reports), `team` (all down the reporting line), `department`, `entity`, `all`. A grant is a permission key plus a scope.
- System roles (cannot be deleted, can be duplicated): Employee, Manager, HR Officer, HR Administrator, Payroll Administrator, Recruiter, Hiring Manager, Finance Approver, Asset Manager, Auditor (read only, no salary fields unless granted), Administrator (all). A user may hold several roles; effective permissions are the union.
- Custom roles: Settings > Roles lists roles; New role (name, description, copy from existing), then a permission matrix (rows: resources, columns: actions, cell: scope select or none). Save validates that an enabled action implies its read permission. A role in use cannot be deleted; it can be disabled.
- Field level security: salary, bank, government ID, medical, and disciplinary fields are protected by separate keys (`salary.read`, `bank.read`, `idnumber.read`, `medical.read`, `disciplinary.read`). Without the key, the API omits the field and the UI shows a lock icon with a tooltip "You do not have access to this field."
- Dynamic scope resolution uses the reporting line and department tree at request time. Delegation: a manager can set a delegate and date range (H3 and P4 use it); the delegate inherits only the approval permissions for that range.

**View as (preview) mode.** Administrators and HR Administrators have "View as" in the account menu: choose a user; the app reloads their view with a persistent banner "Viewing as Isha Raman, read only. Exit". All writes are blocked with the `forbidden` refusal "Read only while viewing as another user." The audit log records the start and end of each View as session.

**Controls and outcomes.** Every control in accounts and roles is O1, O2, O3 or O6. Disabling the last administrator is refused with a reason (O6). Changing your own role is refused.

**Done when.** An Employee cannot open `/payroll` by URL (shows a not allowed page with a link home), cannot read another employee's salary through any list or detail, and a Manager sees only direct and indirect reports. Permission tests cover every role against every resource in the contract suite.

### P3. Settings

A tabbed page at `/settings` (sections rendered as a list on xs). Every setting is read by real code; if no code reads a setting, remove the setting.

| Section | Contents and effect |
| --- | --- |
| Company | Legal entities (name, registration numbers, address, PAN, TAN, PF and ESI codes), logo, locations (address, time zone, geofence, work week, holiday calendar assignment), departments (tree with parent, head, cost center), job titles and grades, cost centers. These feed forms, documents, payroll and the org chart. |
| Calendar and time | Fiscal year start, week start, default work week and daily hours, rounding rules for attendance, holiday calendars (H3). |
| Numbering | Prefix, padding and reset rule for each counter (4.4.4). |
| Approvals | Approval policies (P4). |
| Notifications | Company defaults for events and channels (P5). |
| Appearance | Theme (system, light, dark), density default, drawer mini variant, language (English only; keep strings in a message catalog so more can be added). Per user, stored in `lib/prefs`. |
| Security | Idle timeout, password rule display, MFA requirement by role, sign-in lockout values, "View as" enablement, security statement (1). |
| Custom fields and forms | P9. |
| Roles | P2. |
| Data | P7: storage meter, export, import, backup schedule reminder, remove sample data, reset workspace. |
| Automations | P11. |
| Payroll configuration | H10, shown only to Payroll Administrator and Administrator. |

Controls: each save is O1 with audit, each toggle takes effect immediately and visibly (for example Appearance changes the theme on click). Reset to defaults is available per section with confirmation.

**Done when.** Changing the week start changes calendars and timesheet weeks; changing a numbering prefix changes the next generated code; changing the idle timeout changes sign-out behavior (test with a clock stub).

### P4. Approval engine and Requests inbox

**Model.** `approvalPolicies`: name, subject type (leave, expense, advance, regularization, timesheet, requisition, offer, asset request, shift swap, document release, salary revision, loan, resignation, custom), conditions (amount, days, leave type, department, grade), and an ordered list of steps. A step is: approver type (direct manager, manager's manager, department head, role, specific user, HR owner of the employee), mode (any one approves, all must approve), due in hours, on timeout (escalate to next level, auto-approve, auto-reject, remind only), and whether the requester may skip it when they are the approver (self approval is never allowed). Policies are ordered; the first whose conditions match applies; a default policy per subject type always exists.

**Runtime.** `approvalRequests` and `approvalSteps` hold a snapshot of the policy at submission time so later policy edits do not change in-flight requests. Decisions: Approve, Reject (comment required), Return for changes (comment required; requester edits and resubmits), Delegate (to another eligible user), Reassign (HR only). On the final approval the subject's service runs its `onApproved` rule (for example deducting leave balance), on rejection `onRejected`. Cancelling an approved item (for example leave) creates a reversal through the subject's service and its own approval step only if the policy says so.

**Requests inbox (`/requests`).** Tabs: To review (assigned to me or my delegators, sorted by due date), Submitted by me, All (HR, with permission), Completed. Each row: subject summary, requester, amount or dates, age, due, step progress chips. Bulk Approve and Reject for selected rows (comment applies to all). A detail drawer on md and larger (full page on xs) shows the subject details, the policy chain with each step status, comments, and the subject's own context (for leave: the team calendar for those dates and the balance after approval).

**Timeouts and escalation.** The scheduler (P10) checks hourly, applies the step timeout rule, writes system messages, notifies.

**Policy editor (Settings > Approvals).** List by subject type; New policy; edit conditions with the same filter builder component; add, reorder (dnd-kit) and remove steps; Test policy: pick an employee and sample values and the editor shows the resolved chain without creating anything. A policy used by in-flight requests can be edited; it affects only new submissions.

**Done when.** A leave request of 12 days follows a two step chain (manager, then HR) while 2 days follows one step; an approver on leave with a delegate sees the item under the delegate; timing out escalates and notifies; the inbox badge matches the count of items in To review.

### P5. Notifications and preferences

**In-app notifications.** Stored in `notifications`: recipient, event key, title, body, link, createdAt, readAt, actor. The bell opens a popover with the 10 latest and View all (`/notifications`: filters All, Unread, Mentions; Mark all read; per row Mark read and Open). Unread count in the accent badge. Opening an item marks it read and navigates to the exact record and tab.

**Events** (each module section lists which it emits): request submitted, request decided, reminder, mention, assignment, due soon, overdue, approval escalated, document to sign, document signed, payslip published, birthday and anniversary (opt in), announcement, ticket reply, interview scheduled, scorecard due, review due, survey open, asset due back, certificate expiring, contract ending, probation ending, backup overdue.

**Preferences.** Per user, per event: in-app (on or off), browser notification (uses the Notification API when permitted; requires a click on "Enable browser notifications" and a granted permission, shows the actual permission state, and works only while the app is open), and email digest (see Outbox below). A quiet hours range suppresses browser notifications. Company defaults in Settings > Notifications; users override.

**Email, honestly.** No server exists, so nothing is sent. Messages that would be email (offer letter to a candidate, interview invitation, welcome message, digest) are created in the Outbox (`/outbox`, HR roles and others who send messages): each message has recipient, subject, body (from a template with merge fields), attachments, status (draft, ready, marked sent). Actions: Open in mail app (`mailto:` with subject and body filled; attachments are noted as not attachable through mailto), Download as .eml (with attachments encoded), Copy message, Mark as sent (records who and when). The backend later replaces this with real delivery; the Outbox record shape is the future send job.

**Done when.** Mentioning a user in a note creates an unread notification for them that deep links to the note; disabling an event in preferences stops new notifications for it; Open in mail app builds a correct `mailto:` URL with encoded content.

### P6. Global search and command palette

Opened by the search icon, `/` (when no input is focused) or Ctrl/Cmd+K. A dialog (full screen on xs) with one field and grouped results: Pages (every navigation destination the user can open), Records (employees, candidates, requisitions, tickets, documents, assets, policies, announcements, articles; permission filtered), Actions (verbs such as "Request leave", "Add employee", "New expense claim", "Start payroll run", "Export people CSV", "Switch to dark theme", "Sign out"; each runs the real action or opens its form), Recent (the last 10 visited records). Arrow keys move, Enter opens, Escape closes. Prefix filters: `>` actions only, `@` people only, `#` tickets and requisitions by code.

Index: built by the search worker from `searchIndex` rows `{resource, id, title, subtitle, text, scopeKey}` kept up to date inside the unit of work. Ranking: exact code match, then prefix match on title, then token matches, boosted by recency. The index excludes fields the user cannot read (salary, notes marked private).

**Done when.** Typing "isha" finds Isha Raman with department and title; typing "leave" lists Request leave and Time off; a user without `payroll.read` never sees payroll records or pages; results update after creating a new record without reload.

### P7. Backup, restore, import, data tools

**Export backup.** Settings > Data > Export backup builds a zip (fflate) containing `manifest.json` (app version, schema version, workspace id, counts, createdAt, checksum), one JSON file per store (newline delimited), and `files/` with the blobs. Options: include files, encrypt with a passphrase (PBKDF2 then AES-GCM over the zip; the manifest states encryption parameters in plain). Shows progress for large exports.

**Restore.** Upload a backup; the app validates the checksum, reads the manifest, rejects a newer schema version with a clear message, migrates older versions, then shows a summary (counts per store, date) and a choice: Replace this workspace (requires typing the company name, and downloads an automatic safety backup first) or Cancel. After restore, all sessions end.

**Backup reminders.** A banner appears when the last backup is older than the configured number of days (default 7) and the workspace has more than 10 changes since; the notification event `backup overdue` goes to administrators. Optional: File System Access API "Save to a folder" where supported, otherwise download.

**CSV and file tools.** Data tab lists each importable entity with Download template, Import (SRB8), and Export all. A batch history table shows each import with counts and a Roll back action (SRB8, within 30 minutes).

**Remove sample data.** Deletes only records flagged `sample: true` (all sample records carry the flag), their files and their audit entries' references, after a confirmation that lists counts. Real records you added stay.

**Reset workspace.** Requires typing the company name and the administrator's password; wipes IndexedDB, sessions and prefs, and returns to the wizard.

**Done when.** Export then reset then restore yields byte identical record JSON and working file previews; an encrypted backup fails with a wrong passphrase and succeeds with the right one; removing sample data leaves user-created records intact.

### P8. Audit log

Stored in `auditLog` as a hash chain: each entry `{id, ts, actorId, actorName, action, resource, recordId, summary, changes: [{field, from, to}], ip: null, sessionId, prevHash, hash}` where `hash = SHA-256(prevHash + canonicalJSON(entry without hash))`. Written inside every unit of work (4.4.5). Sensitive values (salary, bank numbers, password hashes) are stored as masked change markers (`changed`, no values) unless the actor and the reader both hold the corresponding permission. Actions include sign-in, failed sign-in, sign-out, View as start and end, exports, downloads of sensitive documents, imports, rollbacks, role changes, purges, restores, and every record write.

**Screen (`/audit`, permission `audit.read`).** Table with filters (actor, action, resource, record, date range), search, and detail drawer showing the field diff. Export CSV. A Verify integrity button recomputes the chain and reports "N entries verified, no breaks" or the first broken entry. The log is append only; no UI deletes entries. Retention: Settings > Data can archive entries older than a chosen number of years into a downloadable file (after which a checkpoint entry stores the last hash so the chain still verifies).

**Done when.** Editing an employee's department produces one entry with from and to; tampering with a stored entry in a test makes Verify integrity fail at that entry; an Employee cannot reach `/audit`.

### P9. Custom fields and custom forms (the Twenty idea)

Definitions in `customFieldDefs`: resource, key, label, help text, type (text, long text, number, money, date, boolean, select, multi select, user, employee, url, email, phone, file), options (for selects, with colors from the chip palette), required, default, unique, visibility roles, editable roles, placement (section and order), searchable, filterable, reportable. Values live in the record's `custom` object. Defined in Settings > Custom fields per resource (employees, candidates, requisitions, assets, tickets, expense claims, leave requests, onboarding tasks).

- Forms, detail pages and tables render custom fields from definitions, so a field added today appears in the create and edit forms, the detail page section "Additional information", the filter builder, the column chooser, imports and exports (headers use the label, a hidden column maps by key), and the report builder (H19) if marked reportable.
- Validation derives a zod schema from the definitions at runtime.
- Changing a type after data exists is refused unless the conversion is lossless; deleting a definition archives it (values remain in data and in backups, and the field can be restored).
- Custom forms (`customFormDefs`): the Forms builder lets HR compose a form (sections, fields, conditional visibility `show when <field> equals <value>`) used by: onboarding information collection, exit interviews, surveys, expense claim types, help desk categories, and public forms (referral, careers screening). Responses are stored as records with their form version.

**Done when.** Adding a "Blood group" select to Employees makes it appear in the edit form, the filter builder and the CSV export without code changes; a required custom field blocks save until filled.

### P10. Scheduler and background jobs

A scheduler runs inside the single leader tab (Web Lock). It reads a jobs table (static in code, with enable flags and run times in settings) and also runs a catch-up on app open for anything due since the last run. Each job is idempotent, keyed by `name + date` in `jobsLog` so a repeated run does nothing.

Jobs: approval reminders and escalations (hourly), leave accrual (per plan period: monthly, quarterly, yearly, on anniversary), carry forward and expiry at year end, probation and contract ending reminders (daily), certificate and document expiry reminders (daily), birthday and anniversary notifications (daily, opt in), recurring activity generation, recurring survey and review cycle launch, attendance day close (computes yesterday, marks absences, flags missing punches), timesheet reminders (weekly), asset return reminders, backup reminder, scheduled report snapshots (optional), payroll cut-off reminder, automation timers (P11 "after N days" triggers), session cleanup, search index repair.

Settings > Automations > Scheduler shows each job: name, schedule, last run, result, next run, and actions Run now (executes for real and logs), Pause, Resume. The log table lists runs with duration and counts and the records affected.

**Done when.** Advancing the injected clock by one month and reopening runs accrual exactly once; Run now twice in a row does not double accrue; a job error is logged with its message and does not stop other jobs.

### P11. Automations (workflow engine)

**Model.** A workflow is `trigger -> conditions -> actions`.
- Triggers: record created, record updated (with field), status changed to, date reached (field plus offset, for example 7 days before probation end), schedule (daily, weekly, monthly at a time), approval decided, form submitted, manual button (appears on the record's overflow menu).
- Conditions: the filter builder over the record's fields (AND and OR groups), including related fields one level deep.
- Actions: Create task or activity for a role or user, send in-app notification, create Outbox message from a template, change field value (formula allowed, 4.5), change status, create record (for example onboarding plan from a template), assign approval policy, add to a talent pool, add tag, create ticket, call a webhook (disabled: no network; the action is not offered), wait N days then continue.
- Execution: events from services go to the engine inside the unit of work, actions run in the same transaction (except waits, which create a timer in `workflowRuns`). Loops are prevented by a per-run depth limit of 5 and a per-record per-workflow once-only option.

**Screens.** Settings > Automations: list (name, trigger, last run, run count, on or off switch), New automation (a step by step builder: choose resource and trigger, add conditions, add actions with each action's own small form, name it), Test: pick a record and see which conditions pass and what each action would do without writing (dry run), Save and Enable. Run log: every run with trigger record, result, per action outcome, error text, and Retry for failed runs. Templates: five prebuilt automations shown as starting points that are real workflows when added (Welcome tasks when an employee is created, Probation review 14 days before end, Document expiry reminder, Birthday notification, Notify manager when a new hire starts).

**Done when.** Enabling "Probation review reminder" and advancing the clock to 14 days before a probation end date creates a task for the manager and a notification; a workflow with a condition that does not match records a skipped run; the dry run shows planned actions and writes nothing.


---

## 6. HR modules (H1 to H19)

### 6.0 How to read a module

Each module lists: Purpose, Who (roles), Routes, Entities (fields that matter, beyond the common record shape in 4.4.1), Screens and controls (with outcome codes from 2.1), Rules (behavior the engines and services must implement), Notifications, and Done when (write each as an automated test). Standard record behaviors SRB1 to SRB12 apply to every entity unless the module says otherwise. Statuses use the chip colors in 3.1: neutral for draft, info for in progress, warning for waiting, success for done or approved, error for rejected or failed.

Navigation groups in the drawer (items appear only when the user can open them): Me (Home, My profile, Time off, Attendance, Timesheets, Expenses, Payslips, Tasks, Requests), People (People, Org chart, Roster, Calendar), Talent (Recruitment, Onboarding, Offboarding, Performance, Learning), Work (Documents, Engage, Help desk, Assets), Money (Payroll, Reports), System (Automations, Audit log, Settings, Help).

### H1. Home and My space

**Purpose.** A working start page and the employee self-service hub.
**Who.** Everyone; widgets depend on role.
**Routes.** `/` (Home), `/me` (My profile, same as `/people/<own id>` with self scope), `/tasks`.

**Home widgets (cards, drag to reorder, hide or show each; layout persists per user).** Each widget shows live data and links to its source.
- Today: date, my shift today, Clock in or Clock out button (H4) with the running timer, break button.
- My leave balances: one row per leave type with available days and a Request leave button.
- To do: my open tasks and activities (due today, overdue, upcoming) with complete checkboxes.
- Requests waiting for me: count and the three oldest with Approve and Reject (H3, P4).
- Who is out today and this week: from approved leave, with department filter.
- Team (managers): direct reports present, on leave, late today; pending timesheets, expenses and regularizations.
- Birthdays and work anniversaries in the next 14 days (respects each person's visibility setting).
- Announcements: latest three pinned or recent (H15).
- Holidays: next two.
- HR dashboard (HR roles): headcount, new joiners this month, exits this month, open requisitions, leave pending, attrition last 12 months, payroll status for the current month. Each number links to the filtered list.
- Setup checklist (P1) for administrators.

**Quick actions menu** (the FAB on xs and sm, a header button on md and larger): Request leave, Regularize attendance, Add timesheet entry, New expense claim, Raise a ticket, Request asset. Each opens the real form of its module.

**My profile (`/me`).** Tabs: Overview, Personal, Job, Time off, Documents, Payslips, Skills, Assets, Goals. Employees edit the personal fields HR allows (phone, address, emergency contacts, dependents, bank details, photo, skills, social links); changes to protected fields (legal name, bank account, government ID) go as change requests that HR approves (H2). Download my data (a zip of everything I can read about myself: profile JSON, payslips PDFs, leave history CSV, documents) is an O4 control.

**Tasks (`/tasks`).** One list of every activity, onboarding task, review task and to-do assigned to the user, grouped by Overdue, Today, This week, Later, Done. Complete (with optional outcome note), Reschedule (date picker), Reassign (if permitted), Open record. A personal quick-add field creates a private to-do. Filters by source module and priority.

**Rules.** Widgets read through the same services as their modules; no separate dashboard tables. The Clock button disappears if attendance is not enabled for the employee (their attendance policy has mode "none") and the widget shows nothing for it.

**Done when.** An employee with a seeded shift sees correct balances after approving a leave in another tab (multi-tab invalidation), a manager's team widget counts match the Attendance list, and hiding a widget survives reload.

### H2. People (employee records, directory, org chart)

**Purpose.** The employee master: single source of truth for everyone else.
**Who.** HR Officer, HR Administrator (all), Manager (reports, limited fields), Employee (self, directory).
**Routes.** `/people` (list), `/people/new`, `/people/:id`, `/people/org-chart`, `/people/accounts` (P2), `/people/changes` (profile change requests), `/people/import`.

**Entities.**
- `employees`: code (counter), first, middle, last name, preferred name, legal name for documents, photo, work email, personal email, work phone, mobile, date of birth, gender, marital status, nationality, blood group, status (candidate-hire pending, active, on notice, on leave, probation, terminated, retired, inactive), type (full time, part time, contract, intern, consultant), join date, probation end date, confirmation date, notice period days, legal entity, location, department, job title, grade, cost center, manager (employee id), HR owner, work mode (office, hybrid, remote), shift default, attendance policy, leave policy, holiday calendar (derived from location, overridable), exit date and reason (set by H13), `idNumbers` (PAN, Aadhaar last four, passport, UAN, ESI number; restricted by `idnumber.read`), address (current, permanent), custom fields (P9).
- `contracts`: employee, type, start, end, terms text, document file, status (draft, active, expired, terminated), renewal reminder days. History is never overwritten: a job or pay change creates a new effective-dated row.
- `jobHistory`: effective-dated changes of title, department, manager, grade, location, type, salary reference. Every change to those employee fields writes a history row with effective date and reason (promotion, transfer, correction, restructure).
- `emergencyContacts`, `dependents` (name, relation, date of birth, nominee percentage, covered by insurance flag), `bankAccounts` (account holder, bank, IFSC, masked number, primary flag, effective from), `employeeSkills` (H14), `employeeDocuments` (H8).
- `profileChangeRequests`: employee, field changes, supporting file, status; goes through P4.

**Screens and controls.**
- **List.** SRB4 with columns: photo, code, name, title, department, location, manager, status, join date, tenure. Quick filter chips: Active, Probation, On notice, Joined this month, No manager, No account. Group by department, location or manager. View toggle: Table, Cards (directory cards: photo, name, title, phone and email actions), Org list. Bulk actions: Export selected CSV, Send message (creates Outbox messages), Change department, Change manager, Assign onboarding plan, Assign policy to acknowledge, Create accounts (P2), Archive. Bulk edits show a preview of old and new values and apply as one audited batch with Undo.
- **New employee form (page, stepper on xs).** Sections: Basic, Job, Compensation reference (restricted), Personal, Emergency and dependents, Bank (restricted), Documents, Review. Duplicate detection warns on matching email, phone, PAN or name plus date of birth (shows candidates and lets HR open them or continue). Save creates: employee, first job history row, leave balances from policy (prorated by join date, H3), optional onboarding plan (H7, a select defaulting to the template for the department), optional account (P2) and a welcome Outbox message from a template. "Save and add another" is offered.
- **Detail page.** Header: photo, name, title, status chip, code, manager link, work email, phone with Copy buttons. Primary actions (permission and status aware): Edit, Promote or transfer (opens the job change dialog that creates a history row with effective date), Change manager, Put on leave of absence, Start offboarding (H13), Create account, View as (P2), Print ID card, Download profile PDF, overflow: Archive, Merge duplicate (pick another record, choose field winners, relinks all dependents; irreversible only after typing the employee code). Tabs: Overview (key facts, reporting line breadcrumb, direct reports avatars, tenure, upcoming leave, probation status), Personal, Job (current and history timeline, contracts), Compensation (salary structure and history, restricted), Time off (balances, ledger, requests), Attendance (monthly calendar with day statuses), Documents (H8), Assets (H17), Skills and training (H14), Performance (goals, reviews, feedback), Payslips (restricted), History (SRB9), plus the Activity panel (SRB7).
- **ID card.** Print ID card generates a PDF of a 86 x 54 mm card (front: photo, name, title, code, entity logo; back: QR with a verification URL path `/verify/employee/<code>` plus emergency phone). The verify route works inside this local app and shows name, status, title only to a signed-in user, and explains that public verification needs the future backend.
- **Org chart.** Interactive tree from manager links (virtualized, collapse and expand, expand all, zoom with buttons and wheel, pan by drag, fit to screen). Node shows photo, name, title, department, headcount below. Switch views: by manager (reporting line) or by department tree. Click a node: popover with profile summary and Open, Message, Show only this branch. Search highlights and centers a person. Drag a person onto another node (HR only) opens the "Change manager" dialog prefilled; it requires confirmation and records history. Export PNG and PDF, and Print. A "Vacancies" toggle shows open requisition positions as dashed nodes.
- **Changes.** `/people/changes` lists profile change requests for HR with Approve and Reject (P4) and a field diff; approving applies the change with history.
- **Import.** SRB8 with a template including every standard field and custom fields, plus dry-run duplicate detection and manager resolution by employee code or email. Rows referencing a manager later in the same file resolve after the whole file is parsed.
- **Directory (employee view).** Employees see the same list with a limited column set: name, title, department, location, work email, work phone, manager. No status other than active, no restricted fields, no export.

**Rules.**
- Employee code is unique and immutable. Email is unique across active employees.
- A manager cannot be a report of their own report (cycle check up the chain; error names the cycle).
- A department cannot be archived while it has active employees or sub-departments (lists blockers).
- Status transitions: probation to active (confirmation, sets confirmation date, notifies), active to on notice (set by H13), on notice to terminated (exit date reached, or manual), any to on leave and back, terminated is final except "Rehire" which creates a new employment record linked to the same person (keeps history).
- Effective dated changes dated in the future are stored and applied by the scheduler on the effective date; the current value is computed from history.
- Changing department, manager or location does not change past records (past payroll, leave and approvals keep their snapshots).
- A terminated employee is hidden from dropdowns but visible in history, reports and filters.

**Notifications.** New joiner announced (if enabled), manager assigned, confirmation due, contract ending, profile change decided.

**Done when.** Creating an employee with a manager and a future joining date produces history, balances, optional account and onboarding tasks; a manager cycle is refused with the chain shown; dragging a node in the org chart changes the manager and the list agrees; bulk change of department shows a preview and Undo restores; the directory for an Employee exposes no restricted fields in the API response (contract test).

### H3. Time off (leave and holidays)

**Purpose.** Leave policies, balances, requests, approvals and team calendar, matching Zoho People and Odoo Time Off.
**Who.** Employee (own), Manager (team), HR (all).
**Routes.** `/time-off` (my overview), `/time-off/request`, `/time-off/team`, `/time-off/approvals` (alias of the Requests inbox filtered to leave), `/time-off/admin/types`, `/time-off/admin/policies`, `/time-off/admin/holidays`, `/time-off/admin/balances`, `/time-off/reports`.

**Entities.**
- `leaveTypes`: name, code, color (from the chart palette), paid or unpaid, unit (days or hours), allow half days, allow quarter days off by default, requires document after N days (with description), requires reason, max consecutive days, min notice days, allow backdating (days), allow negative balance (limit), count weekends and holidays inside a leave (yes or no), gender or status eligibility, encashable, carry forward rules, show in team calendar (name only or type), approval policy, a linked "comp off" flag (earned by working on a holiday).
- `leavePolicies`: name, list of rules `{leaveTypeId, entitlement per year or per period, accrual plan, probation rule (none, no leave, prorated), carry forward cap, expiry months, eligibility (employee type, gender, location, grade)}`; assignment by rules (location, type, grade) with manual override per employee.
- `leaveAccrualPlans`: frequency (upfront at year start, monthly, quarterly, per worked days), amount, proration on join and exit (daily or monthly), max balance, cap per year, start after N months of service (milestone tiers: after 2 years add 2 days).
- `leaveLedger`: append-only entries (employee, type, date, delta in days or hours, reason kind: accrual, request, reversal, adjustment, carry forward, expiry, encashment, comp off, opening balance, reference id, note, actor). A balance is the sum of ledger entries up to a date; `leaveBalances` is a cached projection rebuilt from the ledger (a "Rebuild" admin action verifies it).
- `leaveRequests`: employee, type, start date, end date, start half (full, first half, second half), end half, hours (for hourly types), computed days, reason, attachments, contact during leave, handover note and delegate, status (draft, submitted, approved, rejected, returned, cancelled, withdrawn, taken), approval request id.
- `holidayCalendars`: name, year, locations; `holidays`: date, name, type (public, restricted optional), optional (employees choose up to N optional holidays per year).

**Screens and controls.**
- **My overview.** Balance cards per type (available, used, pending, accrued this year, next accrual date), each with Request, View ledger (dialog with every ledger entry), and a small donut. Table "My requests" with status chips; row actions: View, Edit (draft or returned), Cancel (approved future leave goes through approval if the policy requires it, else immediate reversal), Withdraw (submitted), Duplicate. Calendar toggle shows my year at a glance with holidays and my leave marked.
- **Request leave (dialog full screen on xs, page on larger).** Fields: type, start date, end date, half day options per end, reason, attachment (required by type rules), contact number, handover. Live panel on the right: computed days (excluding weekends and holidays per type rules), balance now, balance after, conflicts (overlap with own leave, blackout periods, minimum team coverage warning showing who else is out), policy messages (notice period, max consecutive). Buttons: Submit, Save draft, Cancel. Submitting runs `engines/leave.validateRequest` and creates an approval request (P4). Hard errors block with explanations; soft warnings allow Submit with an acknowledgement checkbox.
- **Team calendar (`/time-off/team`).** Month, week and year views from real data. Rows are people (grouped by department), columns are days; cells show leave type colors and holidays; hover for details; click a leave to open it (managers approve or reject from the popover). Filters: department, location, leave type, status (approved only, include pending as hatched). Today marker, previous and next, jump to month, export PNG and CSV, subscribe: Download ICS of my leave or the team's approved leave (an O4 file generated now).
- **Approvals.** The leave subset of the Requests inbox (P4) with the context panel (balance after, team coverage).
- **Admin: Leave types.** List and form with all fields above; Archive guarded when requests or balances exist; a type's color picker uses the eight chart colors.
- **Admin: Policies.** Policy editor with a rules table; Assign to employees (rule based or manual) shows the number affected and a preview; changing a policy offers "Apply to existing balances" (recalculates future accruals only; shows the diff before applying).
- **Admin: Holidays.** Calendar management per year and location: Add holiday, Import CSV, Copy from previous year (shifts weekday for fixed weekday rules is not attempted; dates copy as is and HR edits), Mark optional, Set number of optional holidays employees may take. Holidays inside a leave range are not counted when the type says so.
- **Admin: Balances.** Table of every employee and type with available days. Actions: Adjust (add or deduct with reason, creates a ledger entry), Bulk adjust by CSV or by filter (for example give 1 day to everyone), Carry forward run for a year (preview table, then apply), Encash (days to pay, adds a payroll input in H10), Opening balances import (SRB8), Rebuild balances (verifies ledger projection and reports mismatches).
- **Comp off.** An employee or manager records work on a holiday or weekend (from attendance, H4, or manually); with approval it grants a comp off credit with an expiry date as a ledger entry.
- **Delegation.** On the overview: Set delegate with date range (the delegate gets approval authority for that range, P2).
- **Reports.** Leave balance, leave taken by type and department, absenteeism rate, Bradford factor (formula: S squared times D over a rolling 52 weeks), leave liability (days available times daily rate from H10 for payroll roles only). Each is a real report in H19 and links there.

**Rules (engine tests required).**
- Day counting: respects start and end halves; excludes weekends (per employee work week) and holidays when the type says; hourly types count hours against daily hours.
- Overlap with an existing non-cancelled leave is refused, including half-day overlaps (a morning request and an afternoon request on the same day do not overlap).
- Negative balance only if the type allows, within the stated limit; otherwise the form shows how many days are missing and offers unpaid leave if configured as a fallback type.
- Accrual: monthly accrual posts on the first of the month for active employees; prorated by joining day; probation rule honored; no accrual during unpaid leave days beyond a threshold if configured; ends at exit with an optional encashment entry.
- Approved leave deducts at approval time (ledger entry) and reverses on cancellation; rejected or withdrawn leave never touches the ledger.
- Year end: carry forward up to cap, expire the rest at the expiry date, both as ledger entries with notes.
- Leave in a locked payroll month cannot be edited or cancelled without payroll unlocking (error `locked` with explanation).
- Backdated requests beyond the allowed days are refused; HR can enter them with an override reason that is audited.
- Sandwich rule (optional per policy): weekends or holidays between two leave days count as leave.

**Notifications.** Request submitted (to approvers), decided (to employee), reminder, escalation, balance low (optional), carry forward expiring, comp off expiring, delegate assigned.

**Done when.** The test suite covers the day counting and balance matrix (half days, holidays, weekends, sandwich rule, negative balance, overlap); an approved request changes the ledger, the balance card, the team calendar and the dashboard without reload; a cancellation restores the balance; the carry forward run is idempotent per year; the ICS file imports into a calendar app with the right all day events.

### H4. Attendance

**Purpose.** Daily presence: clock in and out, regularization, overtime, and status computation.
**Who.** Employee, Manager, HR.
**Routes.** `/attendance` (my month), `/attendance/team`, `/attendance/regularizations`, `/attendance/admin/policies`, `/attendance/admin/geofences`, `/attendance/admin/devices`, `/attendance/reports`.

**Entities.**
- `attendancePolicies`: mode (none, clock, manual entry, timesheet based), grace minutes late, early exit threshold, full day minimum minutes, half day minimum minutes, break rules (auto deduct unpaid break after N hours), rounding (none, nearest 5, 15), overtime (starts after N minutes beyond shift, multiplier, needs approval, comp off instead), weekly off pattern, late marks per month before a half day is deducted, require geofence, require selfie (captures a webcam photo through `getUserMedia` stored as an attachment if the user grants permission; if denied, the policy shows the refusal reason and the user may not clock in when selfie is required).
- `attendanceEvents`: employee, type (in, out, break start, break end), timestamp UTC, source (web, manual, import, regularization), latitude and longitude (if the browser grants geolocation), distance from geofence, photo file id, note, device label.
- `attendanceDays`: employee, date, shift id, first in, last out, worked minutes, break minutes, late minutes, early exit minutes, overtime minutes, status (present, absent, half day, on leave, holiday, weekly off, missing punch, comp off), flags, computed at, locked flag. A projection that `engines/attendance.computeDay` rebuilds from events; regularizations and leave override it with explanations.
- `regularizations`: employee, date, requested in and out, reason, attachment, status, approver.
- `geofences`: name, center, radius meters, location link, active. Entered by typing coordinates or by "Use my current location" (geolocation prompt). A simple map is not required (no tiles are available offline); show coordinates and radius as a labeled circle diagram.

**Screens and controls.**
- **My month.** A month grid (calendar) with a status chip per day, legend, and a summary strip: present, absent, late marks, worked hours, overtime. Click a day: dialog with events timeline, computed result, and actions: Regularize (form: in time, out time, reason, attachment), Request comp off (if worked on a non-working day), Add note. Clock widget at the top: Clock in, Start break, End break, Clock out, with the running timer and today's shift; location and selfie capture steps appear when the policy requires them, with clear permission refusal messages. Outside geofence: the button is disabled with the distance and radius stated (O6).
- **Team.** Today board (who is in, late, on leave, absent, not yet in), a month matrix (people by days, status codes with a legend), filters, and per row open. Managers can Add manual punch for a report (reason required, audited) and approve regularizations.
- **Regularizations (`/attendance/regularizations`).** Inbox of requests (P4) with approve, reject, bulk approve; each shows the original punches and the proposed ones.
- **Admin: Policies, Geofences.** CRUD with assignment by location or employee; Policy test: choose an employee and a sample day with entered punches and see the computed result.
- **Admin: Corrections.** Bulk import punches (CSV from a biometric device export: employee code, timestamp, in or out; SRB8), Recompute range (rebuilds days for a date range and shows diffs), Lock month (prevents edits and feeds payroll, H10), Unlock (reason, audited).
- **Reports.** Daily attendance, late and early report, absent report, overtime report, missing punch report, monthly summary (feeds payroll as paid days and overtime).

**Rules (engine tests required).**
- Punch pairing: ordered events produce sessions; an out without an in or an unclosed in produces `missing punch`; the day is not marked absent automatically if a regularization is pending.
- Overnight shifts: a session that crosses midnight belongs to the shift start date.
- Status resolution priority: approved leave (full) over attendance; half day leave plus half day worked is present; holiday and weekly off override absent; worked on a holiday creates overtime or comp off credit by policy.
- Late marks: lateness beyond grace increments a counter per month; the Nth late mark deducts half a day of leave (ledger, H3) or marks half day, per policy.
- Rounding and auto break deduction applied after pairing, before thresholds.
- Locked days refuse edits (`locked`).
- All times display in the location time zone; events store UTC.

**Notifications.** Missing punch reminder (next morning), regularization submitted and decided, late mark deduction, overtime pending approval.

**Done when.** Table driven tests cover shifts crossing midnight, missing punches, half day leave plus work, holiday work, grace and late mark deduction; clock in outside the geofence is refused with the reason; a regularization approval changes the day status and the payroll paid days preview; month lock blocks edits.

### H5. Shifts and roster

**Purpose.** Plan who works when (Odoo Planning, Zoho Shifts).
**Who.** Manager, HR, Employee (view own, request swap).
**Routes.** `/roster`, `/roster/shifts`, `/roster/swaps`, `/roster/open`.

**Entities.** `shifts` (name, code, color, start time, end time, break minutes, crosses midnight computed, grace override, night allowance flag, minimum staffing label), `rosterAssignments` (employee, date, shift id or off, location, role label, published flag, note), `shiftTemplates` (a weekly pattern per employee group), `openShifts` (date, shift, location, role, slots, claimed by), `shiftSwaps` (from, to, date, status, via P4).

**Screens and controls.**
- **Roster grid.** Week view (default) and month view: rows are employees grouped by department or location, columns are days. Cell shows shift chip (color and code). Drag a shift chip from the shift palette (left list) onto a cell with dnd-kit; drag between cells to move; hold Alt to copy; click a cell for a dialog (choose shift, off, leave note). Multi-select cells for bulk assign. Toolbar: Previous, Next, Today, group by, filters, Copy previous week, Apply template, Auto fill (assigns a template pattern to selected employees), Publish (makes the week visible to employees and notifies them), Unpublish, Export CSV and PDF. Rows show weekly hours and warn in red text with an icon when limits break.
- **Conflict detection.** Overlap with leave (shown as a locked cell), assignment on a holiday (warning), more than the allowed hours per week, less than the minimum rest between shifts (default 11 hours), more than N consecutive days, understaffing against the minimum staffing rule per shift and location. The Conflicts panel lists each with a link to the cell.
- **Shifts admin.** Create and edit shifts; archive guarded by future assignments.
- **My schedule.** Employees see published shifts as a list and calendar; Request swap (choose a colleague with a compatible role; the colleague accepts; then manager approves via P4; on final approval both assignments exchange atomically), Claim open shift (first valid claim wins or manager picks, per setting).
- **Open shifts.** Manager posts an open shift with slots; eligible employees get a notification and a Claim button; the manager Approves a claim or Assigns directly.
- **Reports.** Hours scheduled versus worked (from H4), fairness (night and weekend counts per person), coverage by day.

**Rules.** Publishing locks nothing but notifies; edits after publishing notify the affected employee with the change. An assignment feeds H4 as the expected shift for a day. Deleting a shift in use is refused.

**Done when.** Dragging a chip creates an assignment and recomputes weekly hours; a rest period violation shows in the Conflicts panel; an approved swap exchanges both assignments in one transaction; an assignment shows up as the expected shift in H4.

### H6. Recruitment (applicant tracking and careers site)

**Purpose.** Requisition to hire, with a real public careers page, matching Odoo Recruitment and Zoho Recruit.
**Who.** Recruiter, Hiring Manager, HR, Interviewer (any employee invited to a panel), Candidate (public, no account).
**Routes.** `/recruitment` (dashboard), `/recruitment/requisitions`, `/recruitment/jobs/:id` (pipeline), `/recruitment/candidates`, `/recruitment/candidates/:id`, `/recruitment/interviews`, `/recruitment/offers`, `/recruitment/pools`, `/recruitment/referrals`, `/recruitment/admin` (stages, scorecards, templates), public: `/careers`, `/careers/:slug`, `/careers/:slug/apply`, `/careers/status`.

**Entities.**
- `requisitions`: code, title, department, location, positions, type, hiring manager, recruiter, reason (new, replacement, expansion), budget range, target start, justification, status (draft, pending approval, approved, open, on hold, filled, closed, rejected), approval request (P4).
- `jobPostings`: requisition, slug, title, description (rich text with a minimal editor: headings, bullet lists, bold, links), requirements, benefits, location, work mode, employment type, salary range shown or hidden, screening questions (type, required, knockout rule), apply by date, status (draft, published, closed), publish to careers page flag, share link.
- `pipelineStages`: per posting (copied from a template): name, order, type (new, screening, interview, assessment, offer, hired, rejected), automatic actions on enter (send template message, create task).
- `candidates`: name, email, phone, current company and title, experience years, location, source (careers, referral, agency, import, manual), resume file, extracted text (see Rules), links, tags, notice period, expected and current compensation (restricted), skills, talent pool memberships, consent record (timestamp and wording shown), do not contact flag.
- `applications`: candidate, posting, stage, rating (derived from scorecards), status (active, hired, rejected, withdrawn), rejection reason (from a list), answers to screening questions, reference number (for example `APP-2026-00123`), applied at, stage history with durations.
- `interviews`: application, round name, type (phone, video, onsite, assessment), start and end (time zone aware), location or meeting link text, panel (employees), scheduler, status (scheduled, completed, no show, cancelled), notes.
- `scorecards`: interview, interviewer, template criteria with 1 to 5 ratings, strengths, concerns, recommendation (strong yes, yes, no, strong no), submitted at; hidden from other interviewers until the viewer submits their own (blind feedback), unless a recruiter overrides.
- `offers`: application, template, compensation (stored as a snapshot: CTC and breakup lines), joining date, expiry date, status (draft, pending approval, approved, sent, accepted, declined, expired, withdrawn), generated document id (H8), approval (P4).
- `talentPools`, `referrals` (employee, candidate details, job, status, bonus rule and payout via H11 or H10).

**Screens and controls.**
- **Dashboard.** Open requisitions, applications this week, time to hire, source effectiveness, pipeline funnel, interviews today, offers pending. All numbers computed and link to filtered lists.
- **Requisitions.** SRB4 list; New requisition (form, Submit for approval creates a P4 request); on approval, Open creates a posting draft prefilled; Close and Hold require a reason; Fill requires linked hires.
- **Job posting editor.** Rich text, screening question builder (short text, long text, yes or no, choice, number, file; knockout rules mark a candidate "Does not meet requirement" but do not reject automatically unless the setting is on), Preview exactly as candidates see it, Publish, Unpublish, Copy link, Duplicate, Close. Pipeline stage editor with dnd-kit reordering.
- **Pipeline board.** Kanban columns per stage; cards show name, current title, rating, days in stage, tags, source; drag between columns (sets stage, writes history, triggers stage actions, asks for a rejection reason when moving to Rejected); multi-select cards for bulk Move, Reject, Message, Tag, Add to pool; filters by recruiter, tag, rating, source, date; list view toggle with SRB4; quick search; stage totals. Column limits are not used.
- **Candidate profile.** Header with contact actions, current stage, rating; tabs: Overview (resume preview, answers, parsed fields), Applications (all jobs), Interviews and scorecards, Messages (Outbox items and notes), Offers, Activity (SRB7), Compensation (restricted). Actions: Schedule interview, Send message (template picker with merge fields), Move stage, Reject (reason, optional message template), Add to pool, Merge duplicate, Download resume, Anonymize (replaces personal fields with placeholders for a data erasure request; irreversible, requires typing the candidate name, audited).
- **Interview scheduling.** Dialog: round name, type, panel members (autocomplete employees), date, start time, duration, location or link text; shows panel availability using approved leave and their other interviews and warns on conflicts; Save creates the interview, calendar entries for the panel (H18), notifications, and an Outbox message to the candidate from a template with an ICS attachment. Reschedule and Cancel send updated messages. After the end time the interviewers get a scorecard task.
- **Scorecards.** Interviewer form with criteria from the template; Submit locks it (edit allowed by the author for 24 hours with a note). Candidate summary shows an aggregate table (criterion by interviewer) once the user has submitted theirs.
- **Offers.** Create from an application: choose template, enter compensation (uses salary structure components from H10 to produce a breakup and CTC; shows employer cost), joining date, expiry; Submit for approval (P4); on approval Generate letter (H8 PDF with merge fields), Send (Outbox), Mark accepted or declined (with date and note); Accepted enables Convert to employee.
- **Convert to employee.** Opens the H2 new employee form prefilled from candidate, application and offer (name, contact, job, department, manager, join date, compensation reference), assigns the onboarding plan (H7), marks the application hired, closes the posting if all positions are filled, and notifies stakeholders. Resume and offer documents attach to the employee record.
- **Talent pools.** Named pools (for example "Backend, future"); add and remove candidates; Send bulk message to a pool; Create application from pool.
- **Referrals.** Employees open "Refer a candidate" (from Home quick menu or `/recruitment/referrals`): pick a job, enter candidate details, upload resume; track status; when the referred candidate is hired and the retention period passes, the referral bonus becomes a payable item (H11 reimbursement or H10 payroll input) per the rule.
- **Careers site (public, no sign-in).** `/careers` lists published jobs with search, filters (department, location, type, work mode) and the company display name and logo; `/careers/:slug` shows the posting with an Apply button; `/careers/:slug/apply` is the application form: name, email, phone, resume upload (PDF or DOCX, 5 MB), links, screening answers, consent checkbox (with the retention period from settings), Submit. Submission creates the candidate (matching an existing candidate by email), the application at the first stage, stores the resume, writes the audit entry with actor "Candidate", and shows a confirmation page with the reference number and a Copy button. `/careers/status` lets a candidate enter reference number and email to see the current status (a coarse label: Received, In review, Interviewing, Offer, Closed). The public pages use the same Material Design 2 look with a simple app bar, no sidebar, and work while signed out; in the local-only version they work only in the same browser profile, and a banner in the HR view says so ("Applications are stored on this device until the backend is connected.").
- **Admin.** Stage templates, scorecard templates, rejection reasons, message templates (with merge fields `{{candidate.name}}`, `{{job.title}}`, `{{interview.date}}`, `{{company.name}}` and a Preview with sample values), retention period, source list.

**Rules.**
- Resume text extraction: for PDF use pdf.js text content, for DOCX use `mammoth` in the browser, for others skip; extracted text feeds search and a simple skills match (keywords from posting requirements) shown as "Matches 6 of 9 requirements" with the matched terms listed. This is keyword matching and the UI says so.
- Duplicate candidates are detected by email (exact) and phone plus name (fuzzy); applying again attaches a new application to the same candidate.
- Moving to Hired requires an accepted offer or an HR override with reason.
- Rejection reason is mandatory; the candidate message is optional and goes to the Outbox.
- Blind scorecards as described; a candidate with recommendation "strong no" from any interviewer shows a warning chip on the card, not an automatic rejection.
- Data retention: candidates with no active application and no consent renewal after the retention period appear in "Due for deletion" (a list in admin) with a bulk Anonymize.
- Salary expectations are visible only to roles with `candidate.compensation.read`.

**Notifications.** New application (recruiter), stage changed (optional), interview scheduled and reminder (panel and recruiter), scorecard due and overdue, offer approval, offer accepted, referral status.

**Done when.** From the public form, an application appears in the first pipeline stage with the resume previewable; scheduling an interview with a panel member on leave shows the conflict; moving a card writes history and triggers its stage automation; blind scorecards hide others' ratings until submitted; Convert to employee creates a prefilled employee and an onboarding plan; anonymizing a candidate removes personal fields from lists, search and exports.

### H7. Onboarding

**Purpose.** Turn an accepted offer into a productive employee; tasks for HR, IT, manager, and the joiner (Zoho People onboarding, Odoo employee onboarding plans).
**Who.** HR, Manager, new joiner (restricted access before the joining date, only their own checklist and forms), task owners.
**Routes.** `/onboarding` (all plans), `/onboarding/:planId`, `/onboarding/templates`, `/onboarding/templates/:id`, `/onboarding/me` (joiner view).

**Entities.** `onboardingTemplates` (name, applies to department or location or type, list of task templates), `taskTemplates` (title, description, owner type: HR, manager, IT, finance, employee, buddy, specific user; due offset relative to join date in days (negative for pre-boarding), required, type: to-do, upload document, read and acknowledge policy, fill form (P9 custom form), sign document (H8), assign asset (H17), create account (P2), schedule meeting, course enrollment (H14)), `onboardingPlans` (employee, template snapshot, join date, status, progress), `onboardingTasks` (assignee, due, status, completion note, linked record, evidence file).

**Screens and controls.**
- **Plans list.** SRB4: person, join date, template, progress bar with percent, overdue count, status. Filters: starting this week, overdue, incomplete. Bulk Remind owners.
- **Plan detail.** Grouped by timeline (Before day 1, Day 1, First week, First month) and by owner; each task: checkbox, title, owner, due, type icon, and the type specific action button: Upload (file chooser, stores to the employee's documents), Acknowledge (opens the policy or document, requires scroll or open, records timestamp), Fill form (opens the form), Sign (H8 flow), Assign asset (opens an asset picker, creates an assignment), Create account (runs P2 account creation), Schedule meeting (creates a calendar entry H18 with the person), Enroll (H14). Complete marks done with who and when; Reopen; Reassign; Change due date; Skip (reason). Add task (free form or from a task template), Add buddy, Add welcome message (Outbox).
- **Templates.** Editor with task templates reorderable, preview of resulting due dates for a sample join date, Duplicate, Archive. Applying a template to an employee creates tasks with computed due dates and owners resolved from the employee's manager, HR owner and buddy.
- **Joiner view.** Before the start date a new joiner signs in with a restricted role "New joiner" that can read and complete only their tasks, view the company policies marked for joiners, upload documents and fill forms. After the join date the role changes to Employee automatically (scheduler).
- **Automation.** Task completion events trigger P11 workflows (for example notify payroll when bank details are uploaded). Overdue tasks notify the owner and escalate to HR.

**Rules.** Tasks due before the join date for owners other than the joiner can be completed any time; joiner tasks open only after their account exists. Progress counts required tasks only for "complete"; optional ones show separately. A plan is Complete when all required tasks are done; HR can Close with override reason.

**Done when.** Applying a template with offsets generates correct due dates for a join date; completing an Upload task puts the file in the employee's documents; completing Assign asset creates an assignment visible in H17; the joiner can open only their checklist (permission test).

### H8. Documents, letters, e-signature and policies

**Purpose.** Store employee documents, generate letters from templates, collect signatures and policy acknowledgements.
**Who.** HR, Employee (own), Manager (limited), Legal reviewers.
**Routes.** `/documents` (my documents and company library), `/documents/employee/:id`, `/documents/templates`, `/documents/letters`, `/documents/signatures`, `/documents/policies`, `/documents/policies/:id`, `/documents/expiring`.

**Entities.** `documentTypes` (name, category, mandatory for, expiry tracked, visible to employee, confidential), `employeeDocuments` (employee, type, file, issue date, expiry date, status: valid, expiring, expired, missing, rejected; verified by; notes), `documentTemplates` (name, category, body in a rich text editor with merge fields, header and footer with entity logo and address, page size, signatory role, numbering rule), `generatedDocuments` (template snapshot body, merged values, file (PDF), reference number, status draft, issued, voided, signed), `signatureRequests` (document, signers in order each with name, role, status, signed at, method, signature image, typed name, IP not available so omitted, device label, document hash at signing), `policies` (title, version, body or file, category, effective date, applies to (everyone, department, location, new joiners), requires acknowledgement, due days, status draft, published, archived), `policyAcknowledgements` (policy version, employee, at, method).

**Screens and controls.**
- **My documents.** List by type with status chips; Upload (type, issue and expiry dates, file); missing mandatory types shown as rows with Upload buttons; view, download, replace (keeps previous version in history), delete (own uploads only, before verification).
- **Employee documents (HR).** Per employee tab and a cross-employee list with filters (missing, expiring in 30 days, expired, unverified); Verify and Reject (with reason, notifies the employee); Request document (creates a task and notification for the employee); bulk Request; bulk download as zip.
- **Templates.** Rich text editor (headings, bold, italics, lists, tables, alignment), merge field picker inserting `{{employee.name}}`, `{{employee.code}}`, `{{job.title}}`, `{{department.name}}`, `{{join_date}}`, `{{salary.ctc}}` (restricted), `{{company.name}}`, `{{today}}`, `{{manager.name}}`, custom fields, and loops over compensation lines. Preview with a chosen employee; unknown fields are flagged as errors before saving. Starter templates included: offer letter, appointment letter, confirmation letter, salary revision letter, promotion letter, experience letter, relieving letter, address proof letter, NOC, warning letter, internship certificate.
- **Generate letter.** Choose template and employee (or several for bulk), review merged text with the ability to edit this instance, Generate PDF (jspdf from the structured content; header, footer, page numbers, signatory block), assigns a reference number from a counter, saves to the employee's documents and generated list, and offers Send for signature and Send via Outbox. Void keeps the record with a watermark "VOID" in a re-generated PDF.
- **E-signature.** Send for signature chooses signers (employee, manager, HR, external name and email for candidates). Signer opens the document in a viewer, sees the PDF, and signs by Draw (canvas pad with clear and undo), Type (name rendered in a handwriting-style font that ships bundled), or Upload an image; checks "I agree to sign electronically"; Sign. The app computes SHA-256 of the PDF bytes, stamps a signature block page appended to the PDF with names, times, and the hash, stores the signed PDF as a new version, and records the audit trail. Declining requires a reason. Signing order is enforced for sequential flows. Status views: Waiting for others, Waiting for me, Completed, Declined, Expired (with Resend and Cancel). Verify (`/verify/document/<ref>`): upload a PDF to compare its hash with the stored hash and report match or mismatch. Legal note in the UI: this is an internal acknowledgement signature, not a certified digital signature, and the app says so on the signing screen.
- **Policies.** Policy library with versions. Publish creates acknowledgement tasks for the target audience and notifies them. Employee view shows unread policies as tasks; Acknowledge button records time after the policy is opened. HR view per policy: acknowledgement table (who, when, pending), progress bar, Remind pending (notification and Outbox), Export CSV. New version: Clone to new version resets acknowledgements for the affected audience with a "what changed" note.
- **Expiring documents.** List driven by expiry dates (passport, visa, certifications, contracts) with reminders from the scheduler at 60, 30 and 7 days.
- **Company library.** Shared files (handbook, forms, org policies) with folders, permissions by role, and search.

**Rules.** Confidential documents are not visible to the employee unless the type says so; downloads of confidential documents are audited. Files obey SRB6 limits. Generated PDF content is deterministic from the stored merged text and template snapshot. A signed document is immutable (changes create a new document). Policy versions are never edited after publish.

**Done when.** Generating an offer letter PDF includes merged values and opens in a PDF viewer; a two signer request enforces order; the hash on the signature page matches a recomputed hash and tampering fails Verify; unacknowledged policies create tasks and the acknowledgement table fills as users acknowledge; expiring documents appear at the right thresholds with the clock stub.

### H9. Timesheets and projects

**Purpose.** Hours against projects and tasks, billable and non-billable, with approval and lock (Zoho People timesheets, Odoo Timesheets).
**Who.** Employee, Manager, Project manager, HR, Finance.
**Routes.** `/timesheets` (my week), `/timesheets/approvals`, `/timesheets/projects`, `/timesheets/projects/:id`, `/timesheets/reports`.

**Entities.** `projects` (name, code, client name, manager, members with roles and rates, budget hours, budget amount, start and end, billable default, status active, on hold, completed, archived, tasks), `tasks` (project, name, assignee, estimate hours, status), `timesheets` (employee, week start, status draft, submitted, approved, rejected, locked, total hours), `timesheetEntries` (timesheet, date, project, task, hours or start and end, billable, description).

**Screens and controls.**
- **My week.** Grid: rows are project and task, columns are Mon to Sun with totals, add row (autocomplete of projects and tasks I am a member of), type hours in each cell (decimal or `1:30`), description per cell via a small popover, billable toggle per row. Timer: Start timer on a row, Stop adds the elapsed time rounded per setting; only one timer runs; the timer survives reload (stored start time). Copy last week's rows. Totals per day compared to the expected hours (from shift or policy); under and over states show helper text. Submit week (blocked if hours missing against the policy when "require full hours" is on, with a message naming the days), Recall (if not yet approved). Previous and next week.
- **Approvals.** Managers and project managers see submitted timesheets by employee and by project; per entry Approve, Reject (comment), Approve all; opening shows the grid read only. Bulk approve.
- **Projects.** List, New project (members with hourly cost and bill rates restricted by `project.rates.read`), project detail with tabs (Overview: budget burn chart, Members, Tasks (list and board), Time entries, Costs, Activity). Actions: Complete, Archive, Duplicate (without time entries), Export entries.
- **Reports.** Hours by project, person, client, billable ratio, utilization (billable hours over available hours), budget variance. Export CSV and PDF.

**Rules.** Entries cannot be added to archived or completed projects, or to dates beyond the lock date. A locked week requires an admin unlock with reason. Approved billable hours feed an optional invoice-ready export (CSV of lines; no invoicing module is built). Hours feed payroll for hourly or contract employees (H10 input of type hours).

**Done when.** Typing `1:30` stores 1.5; the timer persists across reload and stops into the correct cell; submitting an incomplete week is blocked with day names; approval locks entries; the utilization report matches a hand computed sample.


### H10. Payroll

**Purpose.** Compute, review, approve, lock and publish monthly payroll with payslips, statutory deductions, loans, reimbursements and full and final settlement (Zoho Payroll, Odoo Payroll).
**Who.** Payroll Administrator (run, configure), HR Administrator (view, approve), Finance Approver (approve), Employee (own payslips and declarations).
**Routes.** `/payroll` (runs), `/payroll/runs/:id`, `/payroll/structures`, `/payroll/components`, `/payroll/employees` (salary assignments), `/payroll/inputs`, `/payroll/loans`, `/payroll/declarations`, `/payroll/statutory`, `/payroll/fnf`, `/payroll/reports`, `/payroll/config`; employee side `/payslips`, `/payslips/:id`, `/payroll/my-declaration`.

**Important.** Statutory rates, slabs and ceilings change. They are stored as editable configuration with an effective date, never hard-coded, and the config screen shows a banner: "These values are sample defaults. Verify them against current law and your advisor before running real payroll." Do not present the defaults as authoritative.

**Entities.**
- `salaryComponents`: name, code, type (earning, deduction, employer contribution, reimbursement, perquisite), calculation (fixed amount, percentage of another component, formula using `engines/formula`, from attendance (per paid day), from inputs), taxable flag, part of PF wages, part of ESI wages, part of gross, shown on payslip, proration rule (by paid days or not), order, active. Variables available to formulas: `basic`, `gross`, `ctc`, `paid_days`, `working_days`, `lop_days`, `overtime_hours`, `grade`, plus any other component code evaluated earlier in order; dependency cycles are detected on save.
- `salaryStructures`: name, list of components in order, applicable grades. Versioned: editing creates a new version with an effective date.
- `employeeSalaries`: employee, structure version, annual CTC or monthly gross (stored in paise), per component overrides, effective from, reason (joining, revision, correction); history preserved. A revision with a back date creates an arrears calculation preview for the months already paid.
- `payrollConfigs`: effective dated records of statutory settings: PF (employee rate, employer rate split, wage ceiling, whether the ceiling applies, admin charges), ESI (threshold, employee and employer rates), professional tax slabs by state (monthly slabs and the February adjustment), labour welfare fund (by state, optional), TDS (regimes, slabs, standard deduction, rebate rules, surcharge, cess), gratuity (days per year, minimum service years, formula), bonus (rate, ceiling), rounding (to rupee or to paisa), pay period (calendar month, custom cutoff day), payment day. Seed an India sample config for the current financial year.
- `payrollRuns`: period, status (draft, computed, in review, approved, finalized, paid, reopened), employee count, totals (gross, deductions, net, employer cost), checks (list of warnings), approval (P4), created by, finalized at.
- `payslips`: run, employee, snapshot of salary and components, attendance snapshot (paid days, lop days), lines (code, name, type, amount, taxable, ytd), gross, deductions, net, employer contributions, status (draft, published), published at, PDF file id. A payslip is a frozen snapshot: later edits to salary or components never alter it.
- `payrollInputs`: employee, period, kind (one time earning, one time deduction, overtime hours, incentive, arrears, bonus, leave encashment from H3, reimbursement from H11, loan recovery from loans, other), amount or quantity, note, source reference, status (pending, included, excluded).
- `loans`: employee, type (salary advance, loan), principal, interest rate and method (none, flat, reducing), tenure months, start month, instalment schedule (generated), outstanding, status; approval via P4; recovery lines are payroll inputs generated for each run.
- `taxDeclarations`: employee, financial year, regime choice, declared investments by section with amounts and proof files, HRA details (rent paid, landlord details), previous employer income, status (open, submitted, verified), verified by.
- `fnfSettlements`: see below.

**Screens and controls.**
- **Runs list.** Table of runs with status chips and totals; New run (choose period, includes; the app warns if the previous run is not finalized or attendance for the period is not locked in H4, with links). Row actions depend on status: Open, Delete draft, Reopen (finalized run, only when not paid, requires reason, audited, reverses ledger effects of that run).
- **New run wizard.** Steps: 1 Period and employees (include rule: active and on notice, joined before period end, not terminated before period start; exclusions list with reasons), 2 Attendance (shows paid days and lop per employee from H4 with unresolved items such as missing punches linking to the fix; a Lock attendance for period button), 3 Inputs (shows pending inputs for the period; add, edit, include or exclude, Import CSV (SRB8)), 4 Review and Compute.
- **Compute.** Runs in a worker with progress; for each employee calls `engines/payroll.computeEmployee`. Results table: employee, paid days, gross, deductions, net, employer cost, variance versus last month (percent and absolute, highlighting above a threshold), warnings (negative net, missing bank account, missing PAN, salary not assigned, loan over recovery, attendance not locked). Row click opens the payslip preview with each line and the formula trace for components (hover shows the expression and values). Actions per row: Hold (exclude from payment, pay later), Release hold, Recompute, Edit inputs, Skip.
- **Review and approval.** Summary cards (headcount, gross, net, employer cost, statutory totals), variance table, checks list that must be resolved or acknowledged (acknowledgement stored with name and time), Submit for approval (P4, Finance Approver), Approve, Return. Finalize locks the run, writes ledger effects (loan instalments recovered, leave encashment consumed, reimbursements marked paid), locks H4 and H3 changes for the period, creates final payslips as snapshots, and notifies. Publish payslips (separate step) makes them visible to employees and notifies; Unpublish before payment is possible with reason.
- **Payment.** Bank advice file: CSV in a generic format (employee code, name, bank, account (full number visible only to Payroll Administrators), IFSC, amount, narration) and a PDF summary; Mark as paid (date, reference) sets the run to paid. Bank formats for a specific bank are out of scope; the CSV column mapping is editable in config.
- **Payslips (employee).** List by month; payslip detail shows earnings, deductions, employer contributions, year to date, leave balance snapshot, loan balance; Download PDF (jspdf: company header, employee block, tables, net pay in words in the Indian system, footer line "System generated payslip"). Password protection of PDFs is not offered because jspdf cannot encrypt reliably; the payslip view itself is access controlled. Employees can ask a question about a payslip (creates a help desk ticket H16 with the payslip linked).
- **Structures and components.** CRUD with a formula editor (text with syntax checking, variable chips, live test with a chosen employee showing the evaluated result) and a structure preview table with a sample CTC. Components in use cannot be deleted, only deactivated for future versions.
- **Employee salaries.** List with filters (no salary assigned, revised this month). Assign or revise: enter annual CTC, pick structure, see the monthly breakup (components with amounts, employer contributions, in-hand estimate) and a comparison with the previous salary; effective date and reason; creates a salary revision letter option (H8). Bulk revision: percent or amount for a filtered group with preview and approval (P4). Back-dated revisions produce an Arrears input per month already paid, previewed before saving.
- **Inputs.** Cross-employee list for the open period with status, edit, exclude; Import CSV; Add input form.
- **Loans.** List, New loan (schedule preview), approve via P4, Skip instalment (reason, extends tenure), Prepay or Foreclose (outstanding recomputed), Close; recovery appears as inputs in runs.
- **Tax declarations.** Employees declare by section with proof upload (windows set in config: declaration window and proof window); HR verifies each line (Accept, Reject with reason); verified amounts drive TDS projection. Regime choice per employee. Form 12BB style PDF export (a simple structured PDF of declarations; the official format is not claimed).
- **Statutory.** Per run and per period outputs: PF contribution statement (CSV by employee: UAN, PF wages, employee share, employer share split), ESI statement, professional tax summary by state, TDS summary by employee (income, tax, deducted so far, balance), and a Form 16 style annual statement generator for an employee (PDF summary of taxable income and tax deducted; labeled "Summary statement, not a filed Form 16"). These are computed outputs, not filings.
- **Full and final (FNF).** Started from H13 or here for a terminated employee: components: pending salary for days worked, leave encashment (days times daily rate per policy), notice period shortfall recovery or pay in lieu, gratuity (if eligible by years of service in config), bonus, reimbursements pending, loan outstanding recovery, asset recovery charges (H17), other adjustments; each line editable with a note; computed total payable or recoverable; approval via P4; produce the FNF statement PDF and relieving documents (H8); mark paid. TDS on FNF uses the annual projection engine.
- **Reports.** Payroll register (all lines), salary summary by department, cost center and entity, bank advice, variance report, statutory summaries, employer cost trend, headcount cost, YTD earnings, loan outstanding, leave encashment liability.
- **Config.** Pay period settings, statutory tables (view, add a new effective dated version, compare versions), payment day, rounding, bank CSV mapping, PDF layout options (logo, footer text, show or hide components), who can see net pay in team views.

**Rules (engine tests required; use table driven cases with expected results written out in the tests).**
- All money in integer paise; percentages and proration use rational arithmetic with round half up at stated points only (per component after proration, rounding policy from config); totals are sums of rounded lines.
- Proration: paid days over working days (config: calendar days or fixed 30 or working days). Joiners and leavers prorate by days employed in the month. Lop days come from H4 and H3 unpaid leave.
- PF: employee contribution is the configured rate of PF wages, capped at the wage ceiling when the ceiling setting applies; employer share is split into pension and PF per config; admin charges tracked as employer cost. ESI: applies when the monthly gross is at or below the threshold; a contribution period rule keeps an employee covered until the end of the period they crossed the threshold in (config option). Professional tax: slab by state and gross, February adjustment per state config.
- TDS: annual projection = year to date taxable earnings plus projected remaining months of current monthly taxable pay plus known one time items, less exemptions and deductions allowed by the chosen regime (standard deduction, verified declarations, HRA exemption computed as the least of actual HRA, rent paid minus 10 percent of basic, and 50 or 40 percent of basic by metro flag, applicable under the old regime), slab tax, rebate if eligible, surcharge, 4 percent cess (config), then monthly TDS = (annual tax minus tax deducted so far) divided by remaining months, never negative, with a recomputation each month so that year end matches. Include test cases for both regimes at low, medium and high incomes with the sample slabs.
- A finalized run is immutable. Corrections happen in the next run as inputs (arrears or recoveries) or by Reopen.
- Net pay cannot be negative; if deductions exceed earnings the run flags it, and the excess loan or advance recovery defers to the next month by rule (configurable) instead of producing a negative payslip.
- Compute is deterministic: the same inputs produce byte identical payslip JSON.
- Salary data is visible only with `salary.read`; the API removes salary fields otherwise, including from search, audit values and exports.

**Notifications.** Attendance not locked reminder, run ready for approval, run approved, payslips published, declaration window open and closing, proof rejected, loan approved, FNF approved.

**Done when.** Unit tests cover proration, PF with and without ceiling, ESI threshold crossing, professional tax slabs and February, TDS under both regimes with HRA, back-dated revision arrears, loan instalments, FNF with gratuity and notice shortfall; a run of the sample workspace computes in a worker with progress, produces payslips matching the hand computed sample in tests, finalizes, locks attendance, publishes, and an employee downloads a correct PDF; reopening reverses ledger effects; an Employee cannot read any other payslip or salary through any endpoint (contract test).

### H11. Expenses and advances

**Purpose.** Claim, approve and reimburse employee expenses; handle advances and per diem (Zoho Expense, Odoo Expenses).
**Who.** Employee, Manager, Finance Approver, Payroll Administrator.
**Routes.** `/expenses` (mine), `/expenses/new`, `/expenses/:id`, `/expenses/approvals`, `/expenses/all`, `/expenses/advances`, `/expenses/admin` (categories, rules, rates, trips), `/expenses/reports`.

**Entities.** `expenseCategories` (name, code, GL code label, limit per claim, limit per month, receipt required above amount, tax handling, per diem flag, mileage flag, approval policy), `expenseClaims` (code, employee, title, period or trip, status draft, submitted, approved, partially approved, rejected, returned, reimbursed, cancelled, total, currency (INR only; other currencies not supported, state it), advance used), `expenseLines` (date, category, merchant, amount, tax amount, description, receipt files, billable to project, distance for mileage, policy flags, status per line), `advances` (employee, amount, purpose, status requested, approved, paid, settled, outstanding), `mileageRates` (vehicle type, rate per km, effective), `perDiemRates` (location tier, rate per day), `trips` (employee, destination, dates, purpose, approval).

**Screens and controls.**
- **My expenses.** List with status; New claim (page): header (title, trip optional, project optional), line items table with Add line (dialog: date, category, merchant, amount, tax, description, receipts via file chooser or camera capture on mobile through `capture` attribute, billable toggle with project). Mileage lines compute amount from distance and rate; per diem lines compute from days and tier. Each line shows policy checks live: over limit, missing receipt, duplicate suspicion (same date, merchant and amount within the employee's claims), outside category rules. Buttons: Save draft, Submit (blocked with named reasons if hard rules fail; soft flags require a justification text per line), Recall, Duplicate, Cancel claim.
- **Receipts.** Attach multiple; preview; the app extracts nothing automatically (no OCR); the form says "Enter the amount from the receipt".
- **Approvals.** Managers and Finance approve per claim or per line (partial approval with reasons), bulk approve, return with comments, reject; amount adjustments by the approver require a reason and show the original amount. Finance sees policy flags and receipts side by side.
- **Reimbursement.** Approved claims become reimbursements: choose Pay with payroll (creates payroll inputs of type reimbursement for the next run, H10) or Mark paid separately (date, reference). The claim status becomes reimbursed when the payroll run is finalized or when marked paid.
- **Advances.** Request advance (amount, purpose, expected settlement date) via P4; on payment record; when a claim is submitted against an advance it offsets, producing either a payable balance or a recovery; unsettled advances past the date raise reminders and an optional payroll recovery input.
- **Admin.** Categories with limits, rate tables, trip policies, approval policy link, period close (lock expense dates before a given date).
- **Reports.** Spend by category, department, project, employee; policy violations; reimbursement pending; advances outstanding; export CSV and PDF.

**Rules.** Claims cannot include dates earlier than the policy lookback (default 60 days) unless the approver allows. A line over category limit needs an approver override with reason. Totals are computed from lines (paise). Receipts are required above the configured amount. Editing a submitted claim is blocked unless returned.

**Notifications.** Submitted, decided, returned, reimbursed, advance approved and paid, settlement due.

**Done when.** A claim with mileage and a per diem line computes correct amounts; a duplicate-looking line is flagged; a partial approval changes the total and records reasons; paying through payroll creates an input that appears in the next run and marks the claim reimbursed at finalization; advances offset correctly in tests.

### H12. Performance (goals, reviews, feedback, 1 on 1s)

**Purpose.** Align goals, run review cycles, continuous feedback and calibration (Zoho Performance, Odoo Appraisals).
**Who.** Employee, Manager, HR, Reviewer (peers), Leadership (calibration).
**Routes.** `/performance` (my overview), `/performance/goals`, `/performance/reviews`, `/performance/reviews/:id`, `/performance/cycles`, `/performance/feedback`, `/performance/one-on-ones`, `/performance/calibration`, `/performance/competencies`, `/performance/succession`, `/performance/reports`.

**Entities.** `goals` (owner, title, description, type: individual, team, company, parent goal (alignment tree), measurement (key results list with start value, target value, current value, unit, or percentage, or milestone checklist), weight, start and due dates, status draft, active, at risk, achieved, missed, cancelled, visibility), `keyResults`, `goalUpdates` (progress, comment, date), `reviewCycles` (name, period, type annual, half yearly, quarterly, probation, 360, eligibility rules, timeline with dates for self review, peer nominations, manager review, calibration, release, forms per phase, rating scale (labels and values), weights of goals versus competencies, anonymity for peers), `reviewForms` (sections with competency items, rating questions, text questions, goal sections that pull the employee's goals), `reviews` (cycle, employee, reviewer roles, status per phase, self ratings and comments, peer responses, manager ratings and comments, calibrated rating, final rating, overall comment, release status, employee acknowledgement and comment), `feedback` (from, to, kind: praise, constructive, request; visibility private to recipient, shared with manager; text; linked goal or competency; request status), `oneOnOnes` (manager, employee, recurrence, agenda items both can add, notes (shared or private), action items with owners and dates, history), `competencyModels` (competency, description, levels with behavior descriptors, linked to job titles or grades), `succession` (position or role, candidates with readiness (ready now, 1 to 2 years, 3 plus years), risk of loss, notes; restricted).

**Screens and controls.**
- **My overview.** Current goals with progress bars, upcoming review tasks, feedback received, next 1 on 1, quick Ask for feedback and Give feedback buttons.
- **Goals.** List and an alignment tree view (company to team to individual). New goal (form with key results), Update progress (dialog: new current value or percent and a comment; creates a goal update, recalculates progress from key results with weights), Mark at risk (with reason), Close as achieved or missed, Reassign to another owner, Link to parent. Bulk: Create team goal and cascade to members. Manager sees reports' goals and can comment and approve goal setting if the cycle requires it.
- **Cycles (HR).** Create a cycle with the stepper: Basics, Participants (rule builder using the filter component; exclusions; a preview list with counts), Forms and scale, Timeline, Review and Launch. Launch creates a review record per participant, resolves the manager and peers, creates tasks and notifications on each phase date via the scheduler. A running cycle dashboard shows completion per phase per department, overdue lists, Remind, Extend deadline for a person or everyone, Move a phase, Close.
- **Reviews.** A review opens as a stepper by phase for the current user: Self review (rate each competency and goal, write comments, Save draft, Submit), Peer feedback (nominate peers with manager approval if the cycle says so; peers get a task; responses anonymized in aggregates), Manager review (sees self ratings, peer summary, goal progress, past reviews; rates and writes; Submit), Calibration, Release (manager shares results in a 1 on 1; employee Acknowledges with optional comment). Rating scale and weights compute the weighted score in the open.
- **Calibration.** A grid by department of employees with self, manager and proposed final rating; a distribution chart against the target curve; HR and leaders can adjust a rating with a required note; adjustments are audited; Lock calibration then Release.
- **Feedback.** Give feedback (recipient autocomplete, kind, text, visibility), Request feedback from specific people on specific topics; inbox of received and requested; praise can also go to the company wall (H15 recognition) if the user ticks Share publicly.
- **1 on 1s.** A shared page per pair with recurring schedule, agenda (both add items, check them off), private notes (only the author), shared notes, action items that become tasks (H1), and a history list. Schedule creates calendar entries (H18).
- **Competencies and succession.** HR maintains models and uses them in forms; succession plans page shows a nine box style grid (performance by potential from the final rating and a manager-entered potential rating) and candidate readiness lists, restricted by `succession.read`.
- **Reports.** Cycle completion, rating distribution, rating by department, goal achievement, feedback volume, high and low performers lists (restricted), review history per employee exportable as PDF.

**Rules.** A phase cannot start before the previous phase ends unless HR overrides. Anonymous peer responses are aggregated only when at least 3 responses exist; otherwise they appear merged into a "peer comments" list without scores attribution and the UI states why. Employees never see calibration data or others' ratings. A released review is immutable except for the acknowledgement comment. Goal progress is computed: key result progress is (current minus start) over (target minus start) clamped from 0 to 100 percent, goal progress is the weighted average.

**Notifications.** Phase opened, due soon, overdue, nominated as peer, feedback received, review released, goal at risk, 1 on 1 reminder.

**Done when.** Launching a cycle for a rule defined group creates reviews and phase tasks; moving through self, peer and manager phases with the clock stub changes statuses on the dates; fewer than three peer responses are not shown as aggregate scores; calibration changes a rating and the distribution chart updates; releasing and acknowledging closes the review.

### H13. Offboarding

**Purpose.** Manage resignations and exits with clearances, exit interview and settlement (Zoho People exit, Odoo offboarding).
**Who.** Employee (resign), Manager, HR, Department clearance owners (IT, Finance, Admin, Facilities), Payroll.
**Routes.** `/offboarding`, `/offboarding/:caseId`, `/offboarding/templates`, `/offboarding/reports`; employee side `/me/resign`.

**Entities.** `offboardingCases` (employee, type: resignation, termination, end of contract, retirement, absconding, death, other, resignation date, requested last working day, approved last working day, notice period days and shortfall, reason category, status: initiated, approved, in clearance, settlement, completed, withdrawn), `offboardingTasks` (clearance items from a template: owner, department, status, remarks, recovery amount), `exitInterviews` (form from P9, responses, interviewer, date, confidential flag), `fnfSettlements` (see H10).

**Screens and controls.**
- **Resign (employee).** Form: last working day requested (default computed from notice period; shortfall shown), reason category, comments, attach letter. Submit creates the case and an approval request (P4) to the manager and HR. The employee can Withdraw until approval; HR can Accept withdrawal after approval with reason.
- **Case detail.** Timeline header (initiated, approved, clearance, settlement, completed), key facts (notice, shortfall days, leave balance, assets issued, loans outstanding, pending claims) pulled from live data with links, tabs: Overview, Clearance, Exit interview, Settlement, Documents, Activity. Actions: Approve with last working day (can override notice, with reason), Waive or enforce notice shortfall, Change last working day, Start clearance (instantiates tasks from the template), Schedule exit interview, Start settlement, Generate relieving and experience letters (H8), Revoke access (disables the account on the last working day, P2, and lists assets still to return), Complete (enabled only when all required tasks are done or overridden with a reason; sets the employee status to terminated with the exit date, reason and rehire eligibility).
- **Clearance.** Tasks per department with owner assignment; each owner marks Cleared (with remarks and optional recovery amount which flows into FNF) or Pending; asset return links open H17 and mark assets returned; knowledge transfer item with the manager's checklist.
- **Exit interview.** Schedule (calendar H18), conduct with a form (reasons for leaving, ratings on manager, culture, growth, would recommend, would rejoin, comments), mark confidential, and an analysis report across exits (top reasons, by department, tenure, regretted versus non-regretted flag chosen by the manager).
- **Settlement.** The H10 FNF screen embedded, with approval and payment status.
- **Templates.** Clearance checklist templates by department or type.
- **Reports.** Attrition rate (rolling 12 months, by department, tenure bucket, reason), exits by month, regretted attrition, notice period compliance, time to clear.

**Rules.** The last working day drives: leave accrual stop, attendance end, payroll proration, access revocation, and scheduled employee status change. Ending leave balances are offered for encashment per policy at completion. Rehire eligibility is stored and shown during recruitment duplicate detection.

**Notifications.** Resignation submitted and decided, clearance task assigned and overdue, last working day approaching (7 days), exit interview scheduled, settlement approved.

**Done when.** A resignation with a shortfall computes the shortfall days; completing all clearance tasks enables Complete; completing sets status, ends accrual, disables the account on the date (clock stub), and the FNF includes asset recovery and leave encashment; relieving letter PDF generates with correct dates.

### H14. Learning and skills

**Purpose.** Track skills, courses, training sessions, certifications and learning paths (Odoo Skills and eLearning basics, Zoho Learn style).
**Who.** Employee, Manager, HR, Trainer.
**Routes.** `/learning` (catalog and my learning), `/learning/courses/:id`, `/learning/sessions`, `/learning/paths`, `/learning/certifications`, `/learning/skills`, `/learning/admin`, `/learning/reports`.

**Entities.** `skills` (name, category, levels scale, description), `employeeSkills` (employee, skill, level, source: self, manager verified, assessment, verified by and date, last used), `courses` (title, description, type: internal content, external link, instructor led, document, video file; duration; mandatory flag and audience; lessons: ordered lessons of type rich text, uploaded file (PDF or video up to the file limit), link, quiz; pass mark; certificate on completion), `quizzes` (questions: single choice, multiple choice, true or false; correct answers; explanation; attempts allowed; randomize), `enrollments` (employee, course, assigned by, due date, status not started, in progress, completed, failed, expired, progress, score, completed at, certificate file), `trainingSessions` (course, date and time, trainer, location or link, capacity, attendees, attendance marks, feedback), `learningPaths` (ordered courses with prerequisites), `certifications` (employee, name, issuer, number, issue date, expiry date, file, verified), `trainingRequests` (employee asks for an external course with cost and justification, via P4; approved cost can link to an expense advance).

**Screens and controls.**
- **Catalog and My learning.** Search and filter (category, type, mandatory, duration); Enroll or Request; My learning shows in progress with Continue, due dates and completed with certificates.
- **Course player.** A lesson list at left (or a top selector on xs) and the lesson content; Mark complete (automatically when the lesson is opened for rich text, when the video ends for video files, or on quiz pass); progress persisted after each lesson; quiz runner with Submit, score, review of answers with explanations, Retry per attempt rules; on completing all lessons and passing, the enrollment completes and Download certificate (PDF with name, course, date, certificate number and QR to `/verify/certificate/<number>`).
- **Skills.** My skills page with add skill, set level, request manager verification; manager verifies. Team skills matrix (people by skills, colored cells by level) with filters and Export CSV; Skill gap view comparing a role's required skills (from competency models and job titles) with the person's levels and suggesting courses tagged with that skill.
- **Sessions.** Calendar and list; Register, Waitlist when full (auto promotes on cancellation), trainer marks attendance with a checklist, attendees get feedback tasks; completion marks enrollment.
- **Paths.** Build a path (ordered courses, prerequisites, due durations), Assign to people or groups, track progress.
- **Certifications.** Add and verify; expiry reminders at 90, 60, 30 days; Expiring list for HR.
- **Admin.** Course builder (lesson reorder with dnd-kit, rich text editor, file lessons, quiz builder with preview), Assign course in bulk (by filter rule with due date and reminders), Mandatory training compliance matrix (people by mandatory courses, red for overdue), Export.
- **Reports.** Completion rates, overdue mandatory training, hours per employee, cost per department (from training requests), skill coverage.

**Rules.** A course lesson file respects SRB6 plus MP4 and WEBM video up to the configured size (default 200 MB, warn if the storage meter would exceed 80 percent). Quiz scoring is deterministic and stored per attempt. Completed enrollments are immutable except a Reset by HR with reason (keeps history). Certificate numbers come from a counter.

**Done when.** Completing a course with a quiz generates a certificate PDF whose QR route verifies it; mandatory assignment by filter creates enrollments, reminders and the compliance matrix reflects status; waitlist promotion works when someone cancels; the skills matrix matches data.

### H15. Engagement (announcements, surveys, recognition, polls, events)

**Purpose.** Company communication and culture (Zoho People engagement features, Odoo Discuss-style announcements).
**Who.** HR, Communicators (role permission), everyone.
**Routes.** `/engage` (feed), `/engage/announcements`, `/engage/surveys`, `/engage/surveys/:id`, `/engage/recognition`, `/engage/polls`, `/engage/events`.

**Entities.** `announcements` (title, body rich text, attachments, audience: everyone, entity, department, location, role, individuals; publish at, expire at, pin, require acknowledgement, comments allowed, status draft, scheduled, published, expired, archived, read receipts), `surveys` (title, type pulse, engagement, eNPS, onboarding, exit, custom; questions (rating scale 1 to 5, 0 to 10 NPS, single choice, multiple choice, text, ranking); anonymity (anonymous, confidential); audience rule; open and close dates; recurrence; minimum responses before results display (default 5)), `surveyResponses` (anonymous responses store no employee id when anonymous, only a participation record separately so people are not asked twice and the two tables are not joinable), `recognitions` (from, to, badge (from a list HR defines), message, visibility company wide or private, points optional, reactions), `badges`, `polls` (question, options, single or multi, anonymous, closes at, results), `events` (title, date and time, location, description, audience, RSVP yes, no, maybe, capacity, reminder).

**Screens and controls.**
- **Feed.** One stream: announcements (pinned first), recognitions, new joiner and anniversary cards (opt in), polls, events. Filters by type. Each item supports reactions (a small set of Material icons, not emoji), comments (if allowed), and Share link.
- **Announcements.** Compose with rich text, audience builder, schedule, pin, attach; preview exactly as recipients see it; Publish or Schedule (scheduler publishes at the time); Acknowledge button for required ones with the read table for HR (who read, who acknowledged, who is pending, Remind pending); Edit after publish shows an "Edited" marker; Archive.
- **Surveys.** Builder (question list, reorder, logic: skip a question when a previous answer matches, required flags), preview, Publish; respondents answer one question per screen on xs and a single page on larger; Save progress and Submit; HR sees live participation and, once the minimum responses are met, results: distribution charts per question, eNPS score, breakdown by department and tenure only where each segment has at least the minimum responses (otherwise the segment is hidden and the UI states why), text answers listed unattributed, Export CSV of aggregated results (never raw rows linked to people for anonymous surveys), Close early, Reopen, Duplicate, schedule recurring pulses.
- **Recognition.** Give recognition (person, badge, message, public or private), a leaderboard optional by setting (points per badge defined by HR), My recognitions received and given, Reactions.
- **Polls.** Create with options and close time; vote once (changeable until close unless disabled); results bar chart after voting; creator closes early.
- **Events.** Create events (also appear in H18), RSVP, capacity and waitlist, reminders via the scheduler, attendee list, Export ICS per event.

**Rules.** Anonymous means the response table has no employee id and no timestamp finer than the day; participation is recorded separately without a link. Minimum response thresholds apply to every breakdown. Announcement audiences resolve at publish time and for people joining later according to the rule (a setting, default: include new joiners until expiry).

**Notifications.** Announcement published, acknowledgement reminder, survey opened and reminder, recognition received, event invitation and reminder, comment replies.

**Done when.** A scheduled announcement publishes at its time and shows in the audience's feed only; the read table lists exact users; an anonymous survey stores no identity in responses (test inspects the store); a department with fewer than the minimum responses is hidden; poll results match votes; events appear in the calendar.

### H16. Help desk and knowledge base

**Purpose.** HR cases and employee questions (Zoho People case management, Odoo helpdesk style).
**Who.** Employee (raise), HR agents, Department owners (IT, Finance, Admin), Managers (for team tickets).
**Routes.** `/helpdesk` (mine), `/helpdesk/new`, `/helpdesk/tickets/:id`, `/helpdesk/queue` (agents), `/helpdesk/admin`, `/helpdesk/reports`, `/knowledge`, `/knowledge/:id`.

**Entities.** `tickets` (code, requester, subject, description, category (from admin: payroll query, leave, attendance, benefits, IT, access, letters, policy, grievance, other), priority (low, medium, high, urgent), status (new, open, pending requester, pending third party, on hold, resolved, closed, reopened), assignee, team, source (web, created from payslip query, created from a record), confidential flag (grievance goes to a restricted team only), SLA due times for first response and resolution, tags, linked record (payslip, leave request, asset, document), satisfaction rating), `ticketMessages` (author, kind: public reply, internal note, system, body, attachments, time), `slaPolicies` (by category and priority: first response hours and resolution hours, business hours calendar, pause statuses), `cannedReplies` (title, body with merge fields), `knowledgeArticles` (title, body rich text, category, tags, audience, status draft, published, archived, version history, helpful votes, related articles, owner, review date).

**Screens and controls.**
- **Raise a ticket.** Form with category, subject, description, attachments, priority (employees choose among low to high; urgent set by agents), the linked record picker. While typing the subject, show up to 3 matching knowledge articles ("Does this answer your question?") with a Mark resolved by article button that creates the ticket as resolved with that article linked (so deflection counts in reports). Submit gives the code and View ticket.
- **My tickets.** List with status chips; ticket page shows thread, Reply (rich text minimal), Attach, Reopen (within the configured days after resolve), Rate (1 to 5 and comment after resolve).
- **Queue (agents).** SRB4 list with SLA indicators (time left or breached chips), filters (assignee, team, status, priority, category, SLA state, tag), saved views, bulk actions (Assign, Change status, Change priority, Merge, Add tag, Close). Kanban view by status. Ticket page: Reply, Internal note, Canned reply picker, Assign to me, Reassign, Change category or priority, Merge into another ticket, Split (move a message into a new ticket), Link record, Escalate (to a user or team with a note, notifies), Resolve (requires resolution note), Close, Watchers (add colleagues, they get updates), Time spent entries optional. Confidential tickets hide from non-assigned agents and show "Restricted" in lists.
- **Admin.** Categories and teams (members, routing rule: round robin, least loaded, manual), SLA policies and business hours, canned replies, auto close days after resolved, satisfaction survey toggle, ticket numbering, escalation rules (breach to manager), automations via P11 (for example payroll queries route to Payroll team).
- **Knowledge base.** Browse by category, search (P6 index), article page with Helpful or Not helpful (comment on not helpful), Related, Print, Copy link; editors: New article, rich text, publish workflow (draft, review by owner, published), versions with Restore, review date reminders, audience restrictions. Starter articles ship in the sample workspace.
- **Reports.** Tickets by category, first response and resolution time versus SLA, backlog age, agent workload, deflection rate (resolved by article), satisfaction score, top categories, reopen rate.

**Rules.** SLA clocks run in business hours, pause in pending statuses, resume on reply, and breach flags are computed by the scheduler and on read. A resolved ticket auto closes after N days (scheduler). Merge keeps all messages in order and redirects the duplicate. Agents cannot read confidential tickets outside their team.

**Notifications.** Ticket created (team), assigned, reply received, SLA at risk and breached, resolved, reopened, watcher updates, satisfaction request.

**Done when.** The SLA clock pauses and resumes correctly under the clock stub; a deflected ticket shows in the deflection report; confidential tickets are invisible to unauthorized agents (contract test); merging and splitting keep message history intact; satisfaction rating appears in reports.

### H17. Assets

**Purpose.** Track company equipment and its lifecycle (Odoo Equipment, Zoho Assets style).
**Who.** Asset Manager, HR, IT, Employee (own assets, requests), Finance (read).
**Routes.** `/assets`, `/assets/new`, `/assets/:id`, `/assets/requests`, `/assets/categories`, `/assets/maintenance`, `/assets/audits`, `/assets/reports`.

**Entities.** `assetCategories` (name, depreciation method, useful life, custom fields via P9, assignable flag), `assets` (tag (counter), name, category, serial number, model, vendor, purchase date, purchase cost, warranty end, location, status: in stock, assigned, in repair, retired, lost, disposed; condition; current holder; barcode value; attachments (invoice, photos)), `assetAssignments` (asset, employee, issued on, issued by, condition at issue, accessories, acknowledgement (employee signs or acknowledges, H8 style), returned on, condition at return, recovery amount, notes), `assetRequests` (employee, category, justification, status via P4, fulfilled asset), `maintenanceRecords` (asset, kind: preventive, repair, upgrade, date, vendor, cost, notes, next due), `assetAudits` (a stock take: scope, expected list, scanned or checked list, results).

**Screens and controls.**
- **Register.** SRB4 list: tag, name, category, serial, holder, status, warranty end, location. Quick filters: In stock, Assigned, Warranty expiring in 60 days, Maintenance due, Unassigned. Bulk: Print labels, Change location, Export, Import (SRB8), Retire.
- **Asset page.** Header with status and holder, actions: Assign (employee picker, condition, accessories checklist, creates an acknowledgement task for the employee that records the acknowledgement), Return (condition, notes, recovery amount if damaged which flows to FNF or payroll input with approval), Transfer to another employee, Send for repair (creates a maintenance record and status), Mark repaired, Retire, Mark lost (requires note, optionally charges recovery), Dispose (date, value), Print label, Duplicate. Tabs: Overview, Assignment history, Maintenance, Depreciation (straight line or declining balance with schedule table and current book value), Documents, Activity.
- **Labels.** Print label sheet PDF (tag, name, QR encoding `/assets/<tag>` and a Code 128 barcode generated in code) for selected assets in a chosen label size.
- **Scan.** A page with a text field that accepts barcode scanner input (keyboard wedge) and the camera when the browser supports `BarcodeDetector`; opens the asset or marks it found during an audit.
- **Requests.** Employee requests an asset (category, reason); approvals via P4; Asset Manager fulfills by choosing an in stock asset and assigning, or marks "to procure".
- **Maintenance.** Schedule recurring maintenance by category or asset; due list; log work done and cost; next due is computed.
- **Audits.** Start a stock take (scope by location or category), the expected list is snapshotted, scan or tick each item found, mark missing, finish to see discrepancies (found, missing, unexpected) and apply corrections with notes.
- **Reports.** Assets by category and status, by holder, warranty expiry, depreciation schedule and book value, maintenance cost, lost and damaged.
- **My assets (employee).** Shows what is assigned with an Acknowledge button for new items and a Report a problem button that creates a help desk ticket (H16) linked to the asset.

**Rules.** An assigned asset cannot be assigned again without a return or transfer. Retiring an assigned asset is refused with a reason. Depreciation is computed on read from the schedule; no stored accrual entries. Offboarding clearance lists the employee's assigned assets.

**Notifications.** Asset assigned and acknowledgement due, return due, warranty expiring, maintenance due, request decided, audit started.

**Done when.** Assign then Return changes holder, status and history; a damaged return with recovery creates an FNF or payroll item awaiting approval; labels print with scannable codes (decode test using a JS barcode decoder in the test environment); an audit shows discrepancies correctly.

### H18. Calendar

**Purpose.** One place to see company time: holidays, leave, birthdays, anniversaries, interviews, meetings, training sessions, events, shifts, deadlines.
**Who.** Everyone, with per-source permission filtering.
**Routes.** `/calendar`.

**Behavior.** Month, week, day and agenda views, generated from data in other modules through a calendar source registry (each module registers a source that returns entries for a date range and a permission filter). Sources: Holidays (H3), Leave (own, team per permission), Birthdays and anniversaries (opt in), Interviews (H6), 1 on 1s (H12), Training sessions (H14), Events (H15), My shifts (H5), My tasks with due dates (H1), Payroll cut off and pay dates (HR roles), Custom entries.

**Screens and controls.** Source toggles with colors (persisted per user), My calendar and Team calendar scope switch, Today, Previous, Next, date jump, New entry (title, date, time, all day, attendees (employees), location or link, description, recurrence (daily, weekly, monthly, yearly with end), reminder), click an entry opens its real record (for example an interview) or an inline popover for custom entries with Edit, Delete (series or one occurrence), Duplicate. Drag to move or resize custom entries in week and day views (dnd-kit). Attendee RSVP (accept, decline, tentative) with notifications. Export ICS for the visible range and for a selected source (O4). Print.

**Rules.** Recurrence expands with `engines/recurrence` for display; exceptions (edited or deleted single occurrences) are stored. Times display in the user's company time zone; ICS uses UTC with TZID rules for all day entries as dates.

**Done when.** An approved leave, a scheduled interview and a custom entry appear on the right days; toggling a source hides it; editing one occurrence of a recurring entry leaves the series intact; the exported ICS imports into a calendar app with correct times.

### H19. Reports and analytics

**Purpose.** Computed reports across modules and a report builder, matching Odoo and Zoho analytics at a practical level.
**Who.** HR, Payroll, Finance, Managers (team scope), Auditors.
**Routes.** `/reports` (library), `/reports/:name`, `/reports/builder`, `/reports/scheduled`, `/reports/dashboards`.

**Library.** Every module's reports (listed in module sections) appear here grouped by category: Headcount and demographics, Attendance, Leave, Recruitment, Performance, Learning, Payroll and cost, Expenses, Help desk, Assets, Engagement, Compliance (documents expiring, policy acknowledgements, mandatory training), and Audit. Each opens with parameters (date range, department, location, entity, status) and shows a table plus chart where it makes sense, with Export CSV, Export PDF, Print, Copy link (parameters in the URL), Save as view, and Add to dashboard. Permission scope filters rows; restricted columns are removed, not blanked.

**Headcount and diversity details.** Headcount over time (from job history and status history, not just current state), joiners and leavers, attrition (formula: leavers in period divided by average headcount, shown annualized), tenure distribution, age bands, gender distribution (only if gender is recorded; small groups under 5 are suppressed with a note), span of control, manager ratio, vacancy rate.

**Report builder.** Choose a source (employees, leave requests, attendance days, applications, expense claims, tickets, assets, payslips (restricted), timesheet entries, enrollments, custom resources), columns (including related fields one level deep and custom fields), filters (filter builder), grouping (up to two levels) with aggregates (count, sum, average, min, max, distinct count), sort, and chart type (table, bar, line, stacked bar, pie limited to 6 slices). Save with a name, visibility (private, shared with roles), and folder. Edit, Duplicate, Delete (archive). The builder reads the same resource declarations as list filters (4.3), so a new field or custom field becomes available automatically.

**Dashboards.** A user can create dashboards of saved reports as cards (drag to arrange with dnd-kit, resize in grid units), with a date range control that applies to all cards. Share with roles. The Home HR widgets (H1) use the same card renderer.

**Scheduled reports.** In a local-only app nothing runs when the app is closed, so scheduling is honest: a schedule (daily, weekly, monthly) is evaluated by the scheduler when the app is open or at the next open; it generates the report file into the user's Reports inbox (`/reports/scheduled` lists snapshots with Download and Delete) and creates a notification; the screen says "Reports are generated when the app is open." The future backend can run the same definitions.

**Rules.** Report definitions are data (JSON). Aggregations run over the same queries as the lists with scope applied before aggregation; no report can reveal a row a user could not list. Numbers in reports and in the originating list must agree (a test compares them). Charts follow section 3.9 and include a data table view.

**Done when.** Each library report returns correct figures for the sample workspace according to precomputed expected values in tests; a builder report created for leave requests grouped by department matches the Leave admin counts; a user without `salary.read` sees no salary columns in the builder; a scheduled report generated on open appears in the inbox with a notification.


---

## 7. Guidance system (hints, tutorials, explanations)

Guidance exists so a new user understands what each feature is for and how to use it. It is real behavior driven by real data, not slides. It must also be quiet: never block work, always dismissible, never repeat after dismissal.

### 7.1 Layers

1. **Page guide.** Every page has a help icon in the app bar (tooltip "About this page"). It opens a side sheet (bottom sheet on xs) with four blocks: What this page is, Why it exists, How to use it (3 to 6 steps with the exact button names), and Related pages. Content lives in `src/platform/guidance/pages/<route-key>.ts`, one entry per route, written in the copy rules style. A unit test fails if any route lacks an entry or an entry names a button label that no longer exists in the control inventory (`docs/CONTROLS.md`).
2. **Field hints.** A small `info` icon after a label opens a popover with one or two sentences and, where useful, an example. Required on every field whose meaning is not obvious (for example "Notice period", "Accrual plan", "Grace minutes", "Knockout rule", "Calibration"). Hints must state the effect: "Leave taken beyond this balance is refused unless negative balance is allowed."
3. **Empty states.** Every list explains its purpose and offers the first action (SRB10).
4. **First visit tips.** On the first visit to a module, one dismissible banner of one or two sentences with a Show me button that starts a short tour (3 to 5 steps) of that page: each step highlights a real control with a spotlight overlay and a card (Next, Back, Skip). Tours are skippable and replayable from the page guide. Tours never perform actions for the user.
5. **Guide center (`/help`).** Tabs: Start here, Lessons, Glossary, Shortcuts, About this build.
   - Start here: role based checklists (Employee, Manager, HR, Payroll, Recruiter, Admin). Each item states a task ("Request your first leave") with a Go button to the real page. **Items complete automatically from real events** (an event bus emits `leave.request.created` and so on; the checklist subscribes). There is no manual "Mark done" button. Progress persists per user. A checklist can be reset.
   - Lessons: ten short lessons, each 4 to 8 steps with an outcome check that watches for the real event, and a Why this matters paragraph. L1 Find your way around and use the command palette. L2 Request, approve and cancel leave. L3 Clock in, regularize, read your attendance month. L4 Add an employee and set up the org chart. L5 Run a recruitment cycle from requisition to hire. L6 Onboard and offboard someone. L7 Run payroll end to end with checks and publish payslips. L8 Submit and approve an expense claim. L9 Set up a review cycle. L10 Back up, restore and read the audit log. Lessons run in the real app on real or sample data with a "Lesson in progress" chip in the app bar and an Exit lesson control.
   - Glossary: terms with definitions (CTC, LOP, regularization, accrual, carry forward, FNF, TDS, PF, ESI, requisition, scorecard, calibration, eNPS, SLA, comp off, sandwich rule). A term used elsewhere is a link that opens the glossary entry in a popover.
   - Shortcuts: the full list (7.3), generated from the same registry that binds them.
   - About this build: version, schema version, storage use, link to the security statement, the sample workspace notice.
6. **Why tags.** On the first-run wizard and on module landing pages, a one line "Why" explains the business reason (for example on Leave policies: "Policies decide who earns how many days and when, so balances stay fair and auditable").

### 7.2 Behavior rules

- A user can turn off tips (Settings > Appearance > Show tips). The page guide and Guide center always remain.
- Dismissed tips are stored per user (`lib/prefs`) and never reappear unless reset.
- Tours and banners are not shown to the New joiner role except the checklist.
- Guidance copy follows 3.12 and states effects and exact labels. No marketing tone.
- Every tour step's target is found by a stable `data-guide` attribute; a test runs every tour in Playwright and fails if a target is missing or hidden.

### 7.3 Keyboard shortcuts

`/` or Ctrl/Cmd+K open the command palette; `g` then `h` Home, `g` then `p` People, `g` then `l` Time off, `g` then `a` Attendance, `g` then `r` Requests, `?` the shortcuts list; `n` new record on list pages (where the user can create); `Esc` closes dialogs and menus; `j` and `k` move the row focus in lists, `x` toggles row selection, `Enter` opens. Shortcuts are disabled while typing in a field and are listed in Help. A Settings toggle disables single key shortcuts for accessibility (WCAG 2.1.4).

---

## 8. Sample workspace (Kestrel Works)

Optional, loaded from the wizard or Settings > Data > Load sample workspace (when the workspace is otherwise empty). It exists so every screen has realistic data, so the control crawler and tests have fixtures, and so evaluators can try each role. Every sample record has `sample: true`. Generation is deterministic (seeded PRNG, seed in code) and relative to the current date, so dates always look current. It runs as one transaction with a progress bar.

**Company.** Kestrel Works Pvt Ltd, product studio, 48 employees. Entities: one legal entity. Locations: Hyderabad (HQ), Bengaluru, Remote. Departments: Engineering (platform, web, mobile, quality), Design, Product, People and Culture, Finance, Sales, Customer Success, Operations and IT. Grades: G1 to G7. Cost centers per department.

**People.** 48 employees with realistic Indian and international names, a plausible age and tenure spread, 6 managers with 2 levels of reporting, 3 on probation, 2 on notice, 1 on leave, 4 joined this month or last, photos not included (letter tiles). Include edge cases on purpose: one employee with no manager (the CEO), one mid-month joiner, one with a pending bank change request, one with a contract ending in 20 days, one on a half day leave tomorrow, one with an expired passport document.

**Accounts (all with the same documented sample password shown on the sign-in "Sample accounts" card, which is hidden once sample data is removed).** Employee (Aarav Menon), Manager (Isha Raman), HR Officer (Meera Nair), HR Administrator (Kabir Shah), Payroll Administrator (Rohan Desai), Recruiter (Tanvi Joshi), Finance Approver (Sanjay Iyer), Administrator (Priya Kulkarni), Auditor (Dev Anand).

**Module data.**
- Time off: 6 leave types (Casual, Sick, Earned, Comp off, Maternity or paternity, Unpaid), 2 policies, a holiday calendar for the current year with 12 holidays and 2 optional, balances from accrual, 40 historical requests across statuses, 6 pending approvals with different approvers, 1 conflict case (three people from one team requesting the same days).
- Attendance: 90 days of generated punches for everyone (with late arrivals, missing punches, remote days, one overnight shift worker), 5 pending regularizations, one geofence for Hyderabad.
- Roster: 4 shifts (General, Morning, Evening, Night), a published week and a draft week, an open shift, a pending swap.
- Timesheets: 5 projects with budgets, 8 weeks of entries for 20 people, 4 submitted weeks pending approval.
- Recruitment: 6 requisitions (various statuses), 4 published postings, 60 candidates across stages with resumes as small generated PDFs, 10 interviews (past and upcoming) with 12 scorecards, 3 offers (draft, sent, accepted), 2 talent pools, 4 referrals.
- Onboarding: 2 templates, 3 plans in progress (one overdue). Offboarding: 1 case in clearance, 1 completed.
- Documents: 10 document types, files for most employees (generated PDFs), 8 templates, 12 generated letters, 4 signature requests in different states, 5 policies with partial acknowledgements.
- Payroll: India config for the current financial year, 1 structure with 9 components, salaries for all employees, finalized runs for the previous 3 months with published payslips, an open draft for the current month with inputs, 2 loans, tax declarations for 20 employees with 5 proofs pending verification.
- Expenses: 6 categories, 25 claims across statuses, 2 advances.
- Performance: a half-yearly cycle in the manager review phase, 60 goals with key results, 30 feedback items, 1 on 1 series for 6 pairs, a competency model.
- Learning: 12 courses (4 with quizzes), 3 paths, 2 upcoming sessions, 30 skills, 20 certifications (3 expiring).
- Engagement: 6 announcements (1 scheduled, 1 pinned, 1 requiring acknowledgement), 2 surveys (1 open, 1 closed with results over the minimum), 15 recognitions, 2 polls, 3 events.
- Help desk: 40 tickets across statuses with SLA states (2 breached), 12 canned replies, 15 knowledge articles.
- Assets: 90 assets across 6 categories, 60 assigned, 5 in repair, maintenance schedule, 1 audit completed.
- Automations: 5 workflows enabled, with run history. Saved views and 2 dashboards. Notifications for each role.

**Removal.** Settings > Data > Remove sample data (P7). A test loads the sample, removes it, and asserts that no sample-flagged record remains and user-created records are untouched.

---

## 9. Non-functional requirements

### 9.1 Accessibility (WCAG 2.2 AA)

- Semantic HTML first; Radix primitives provide roles for complex widgets. Landmarks: header, nav, main, aside. One `h1` per page (the page title). Skip to content link as the first focusable element.
- All functionality works with a keyboard alone; visible focus (3.6); logical tab order; no keyboard traps; Escape closes overlays; focus returns to the trigger on close.
- Contrast: text at least 4.5 to 1 (3 to 1 for large text and UI components) in both themes. A unit test computes contrast for every token pair in section 3.1 and fails below the thresholds. If a pair fails, adjust that token and record it in `DECISIONS.md`.
- Touch targets at least 48px, never smaller than 24px with spacing (2.5.8).
- Forms: labels programmatically associated, errors announced with `aria-live` and `aria-describedby`, required state conveyed in text.
- Tables: header cells with scope, sortable columns with `aria-sort`, row selection announced. Lists on xs keep semantics.
- Charts: text alternative and a data table (3.9).
- Motion: honor reduced motion. No flashing content.
- Drag and drop (roster, kanban, org chart, reorder) always has a keyboard alternative (move buttons or a menu: "Move to stage", "Move up", "Change manager").
- Language attribute set; dates and numbers formatted by locale; text can scale to 200 percent without loss.
- Automated: axe checks on every route and every dialog in the crawler run, zero serious or critical violations. Manual checklist in `docs/A11Y.md` (screen reader pass on five core flows with NVDA or VoiceOver, keyboard pass, zoom 200 percent).

### 9.2 Security and privacy (local scope)

- No `eval`, no `new Function`, no `dangerouslySetInnerHTML` except through one sanitizing component (DOMPurify) used for rich text, with tests for script and event handler stripping.
- Strict Content Security Policy in `index.html`: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self'; connect-src 'self'; frame-src 'none'; object-src 'none'`. PDF preview uses a canvas renderer (pdfjs) or an object URL in a sandboxed iframe if CSP allows `blob:` for `frame-src`; choose one and document it.
- Uploaded file names are never used as paths; types are sniffed (4.4.9); SVG uploads are rejected.
- Sensitive fields protected as in P2; masked in UI by default with a Reveal button (audited) for account numbers and IDs.
- Clipboard copy of sensitive values clears the confirmation message after 10 seconds (the clipboard itself cannot be cleared reliably, so state this in the hint).
- Idle lock (P2). Screenshots are not prevented.
- Privacy controls: candidate consent and retention (H6), anonymization, Download my data (H1), Data erasure request flow for an employee record that moves personal fields to an anonymized state after the legal retention period setting, audited.
- Dependency hygiene: pin versions, `npm audit` in CI, no unmaintained packages.

### 9.3 Browser and device support

Latest two versions of Chrome, Edge, Firefox and Safari (desktop), Chrome and Safari on Android and iOS. Features that need an API the browser lacks (BarcodeDetector, File System Access, geolocation permission) degrade with a clear message and an alternative (O6). Test at 360, 768, 1280 and 1920 px wide.

### 9.4 PWA and offline

Installable with a manifest (name, icons generated from a plain monogram of the company initial on `--md-primary`, no logo claims), theme color #3F51B5 (dark #1E1E1E), display standalone. The app shell and all code are precached; the app works fully offline since data is local. A "New version available" snackbar with Reload appears when a service worker update is waiting; updates never apply mid-edit without the user choosing Reload. Data migrations run on first open after update, with a pre-migration safety snapshot kept in IndexedDB (the last one only) and a Restore snapshot action in Settings > Data if a migration misbehaves.

### 9.5 Internationalization readiness

All user text goes through a message catalog (`src/i18n/en.ts`) with ICU style plurals; no concatenated sentences. Dates, numbers and currency use `Intl` with the workspace locale. Layout uses logical CSS properties so right to left can be added. Only English ships.

### 9.6 Reliability

Writes are transactional (4.4.5). The app handles `QuotaExceededError`, blocked or deleted databases, and an unavailable IndexedDB (private modes in some browsers) with a full screen explanation and no crash. An error boundary per route shows a recoverable error panel with Copy details and Reload, and never loses unsaved form data (forms autosave drafts to IndexedDB every few seconds in `drafts`; reopening offers Restore draft).

### 9.7 Code quality

TypeScript strict, no `any` without a comment, ESLint clean, no console output in production, no TODO comments (the check script from 2.4 fails on them), files under 400 lines where practical, components documented on `/_kit`. Commit messages are imperative and specific.

---

## 10. Testing strategy

| Layer | Tooling | Required coverage |
| --- | --- | --- |
| Unit, engines | Vitest | Every engine in 4.5 with table driven cases, including each edge case named in module sections. Target 95 percent line coverage for `engines/` and `lib/money`, `lib/dates`. |
| Service and contract | Vitest with fake-indexeddb | Every resource method through the `api` client: CRUD, every filter operator, sort, pagination, optimistic locking conflict, archive and restore, permission denial per role, validation errors, unit of work rollback on injected failure, audit entry per write, search index update, hash chain. |
| Migration | Vitest | For each schema version n, seed version n-1 and verify upgrade. |
| Component | Vitest and Testing Library | Every `ui/` component, states and keyboard behavior. Forms: validation messages and focus on first error. |
| End to end | Playwright | One flow per lesson L1 to L10 and each success scenario step (1), run against the sample workspace as the relevant role. |
| Control crawler | Playwright (2.4) | Every route, every role, outcome assertions, `docs/CONTROLS.md` regenerated, zero failures. |
| Accessibility | Playwright with axe | Every route and dialog in light and dark themes at xs and lg. |
| Visual regression | Playwright screenshots | Key screens in light and dark at 360 and 1280 px; update intentionally. Include `/_kit`. |
| Performance | Playwright | Budgets in 4.11. |
| Offline | Playwright | Load, go offline, perform leave request and an attendance clock in, reload, data intact. Verify no external requests (4.1). |
| Multi-tab | Playwright | Two pages: write in one, other updates; sign out in one signs out both; scheduler leader election. |
| Time dependent | Vitest and Playwright with a controllable clock | Accrual, escalations, reminders, scheduled announcements, onboarding offsets, SLA, auto close, session timeout. |
| Property tests | fast-check | Money arithmetic (sum of parts equals total), leave day counting (never negative, monotonic in range), roster conflict symmetric, payroll compute deterministic and idempotent. |

CI script `npm run verify` runs: typecheck, lint, check-controls, unit and contract tests, build, Playwright suite (headless), axe, contract export. A change is not complete until `verify` passes. Write `docs/TEST-REPORT.md` at the end of each milestone with pass counts and known gaps (gaps must be fixed or the feature removed from navigation, never shipped broken).

---

## 11. Build order

Each milestone ends with: all its "Done when" tests passing, `verify` green, the control crawler green for the routes that exist, `docs/CONTROLS.md` regenerated, and a short entry in `DECISIONS.md`. Do not start a milestone with a failing earlier one. Navigation shows only built modules.

| Milestone | Scope | Gate |
| --- | --- | --- |
| M0 Foundations | Repo, tooling, tokens, typography, elevation, `/_kit` with all `ui/` components in light and dark, app shell (app bar, drawers, bottom navigation, snackbar, dialogs, menus), router, i18n catalog, PWA shell, scripts `check-controls`, ESLint import rules, CSP | Kit page passes axe and contrast tests; shell responsive at all breakpoints |
| M1 Data and API layer | Dexie schema v1, record base, ULIDs, unit of work, counters, optimistic locking, audit chain, BroadcastChannel, file store, `api` client and hooks, list query engine, contract test harness, CSV and import framework (SRB8), search index | Contract suite green on a test resource; chain verify test |
| M2 Platform A | P1 wizard, P2 auth, users, roles, scopes, View as, P3 settings shell, P8 audit screen, P5 notifications, P6 command palette | Role permission tests; lock out tests; sign-in and session tests |
| M3 Standard record behaviors | Generic list, saved views, filter builder, detail shell, Activity panel, attachments, history, empty and error states, bulk bar, column chooser (built on the real People resource, not a generic feature page) | SRB1 to SRB12 tests against People |
| M4 People | H2 complete including org chart, import, ID card, change requests, accounts UI | H2 Done when |
| M5 Platform B | P4 approvals and inbox, P9 custom fields and forms, P10 scheduler, P7 backup and restore, P11 automations | P4, P7, P9, P10, P11 Done when |
| M6 Time off and calendar | H3 and the calendar source registry with H18 | H3, H18 Done when |
| M7 Attendance and roster | H4, H5 | H4, H5 Done when |
| M8 Documents | H8 (templates, PDF, signatures, policies) | H8 Done when |
| M9 Recruitment | H6 including public careers | H6 Done when |
| M10 Onboarding and offboarding shell | H7 and the H13 flow without settlement | H7 and H13 (except FNF) |
| M11 Timesheets | H9 | H9 Done when |
| M12 Expenses | H11 | H11 Done when |
| M13 Payroll | H10 including loans, declarations, statutory outputs, FNF; wire H13 settlement | H10, H13 Done when |
| M14 Performance | H12 | H12 Done when |
| M15 Learning | H14 | H14 Done when |
| M16 Engagement and help desk | H15, H16 | H15, H16 Done when |
| M17 Assets | H17 | H17 Done when |
| M18 Reports, home, guidance | H19, H1 widgets, guidance system (section 7) complete, sample workspace complete (section 8), lessons L1 to L10 | H1, H19 Done when; lesson tests |
| M19 Hardening and backend readiness | Full crawler, axe and visual runs, performance and offline tests, migration tests, docs, contract export, HTTP adapter skeleton built from the contract (section 13), final README | Definition of done (section 12) |

If time is short, cut whole modules from the end of the list (never half a module) and remove them from navigation, routes, settings and the guide. Modules M0 to M7 plus M13 form the minimum credible HR core: people, leave, attendance, approvals, payroll.

---

## 12. Definition of done

The application is done only when all of these hold:

1. `npm run verify` is green, including the control crawler across every route and role with zero failures, axe with zero serious or critical violations, and the offline and no-network tests.
2. `docs/CONTROLS.md` lists every control with its outcome, and none is O-less. The static check finds no banned pattern (2.2).
3. Every module shipped has its Done when criteria automated and passing. No module is in navigation that lacks them.
4. A new person can: create a workspace, load the sample, and complete lessons L1 to L10 using only the app.
5. The success scenario in section 1 runs in under 15 minutes by hand and as a Playwright test.
6. Backup then reset then restore returns the same data; migration tests pass; the app survives a reload at any point with no data loss.
7. No text in the app or the docs uses the banned patterns in 3.12; no emoji; no em or en dashes (a script scans `src/`, `docs/` and the README).
8. Material Design 2 compliance: token usage test (no hex outside `tokens.css`), icon name test, component inventory in `/_kit`, visual snapshots approved.
9. Docs exist: `README.md` (what this is, how to run, how to build, the security statement, how the sample workspace works), `docs/ARCHITECTURE.md`, `docs/API.md` (generated from the contract), `docs/CONTROLS.md`, `docs/DECISIONS.md`, `docs/A11Y.md`, `docs/TEST-REPORT.md`, `docs/BACKEND-INTEGRATION.md` (section 13).
10. Known limitations are listed honestly in the README (no email delivery, no real digital signature certificates, payroll statutory values are configuration to verify, data lives in one browser).

---

## 13. Backend integration plan (for later)

Goal: replace the local adapter with a real service without changing screens.

1. **Contract.** `npm run contract:export` emits `contract/openapi.json` (paths follow 4.3, schemas from zod, error model, pagination, filter grammar, permission keys per operation, file upload endpoints, report endpoints). Treat it as the interface agreement. Any UI change that needs a new endpoint changes the contract first.
2. **Server.** For example FastAPI with PostgreSQL: one table per resource in 4.4.2 (columns for indexed and filtered fields, a JSONB column for the rest and for custom fields), `version` column for optimistic locking mapped to `ETag` and `If-Match`, row level scope enforcement derived from the same permission matrix, an append only audit table with the same hash chain, object storage for files, a job runner (for example a worker with a scheduler) implementing the P10 jobs, an email service consuming the Outbox, and authentication (sessions or JWT with refresh, TOTP) replacing the local auth while keeping the same permission keys.
3. **HTTP adapter.** Implement `api/adapters/http/` against the exported contract: one fetch wrapper that maps resource methods to routes, converts the error model to `ApiError`, handles auth refresh, and uses server sent events or polling for `subscribe`. Set `VITE_API_MODE=http` and `VITE_API_URL`.
4. **Verify.** Run the contract test suite (4.8) against the server. Failures are server or adapter defects, never test changes, except where the contract deliberately changes.
5. **Data migration.** Build an import path: the local backup zip (P7) is the migration format. The server provides a one-time import endpoint that ingests the NDJSON stores, remaps ids if needed (ULIDs can be kept), verifies the audit chain, and reports counts. Users export a backup locally, an administrator uploads it once.
6. **Behavior that moves server side.** Password hashing and sessions, scope enforcement, the scheduler, payroll compute (the same `engines/payroll` can run on the server if the backend is TypeScript; otherwise port it using the test cases as the specification), email delivery, report scheduling, careers site public endpoints (rate limited, CAPTCHA), file virus scanning, backups.
7. **Cutover checklist** in `docs/BACKEND-INTEGRATION.md`: environment variables, CORS, CSP `connect-src` update, PWA caching rules for API routes (network first, no caching of sensitive responses), removal of the local-only banners, removal of the "Sample accounts" card in production builds, and a rollback plan.

---

## Appendix A. Permission catalogue

Format: `<key>`: scopes available. Scopes: S self, R direct reports, T team (all reports), D department, E entity, A all. Roles hold grants as key plus scope. Seed these default grants; HR Administrator can change non-system roles, and system roles can be duplicated and edited as copies.

**Keys.**
- Employees: `employee.read` (S R T D E A), `employee.create` (A), `employee.update` (S limited, R none, A), `employee.archive` (A), `employee.purge` (A), `employee.export` (D E A), `employee.import` (A), `employee.merge` (A), `salary.read` (S, A), `bank.read` (S, A), `idnumber.read` (S, A), `medical.read` (S, A), `disciplinary.read` (A), `profile.change.approve` (A), `account.manage` (A), `role.manage` (A), `viewas.use` (A).
- Time off: `leave.request.create` (S), `leave.request.read` (S R T D A), `leave.request.approve` (R T D A), `leave.request.override` (A), `leave.type.manage` (A), `leave.policy.manage` (A), `leave.balance.adjust` (A), `holiday.manage` (A).
- Attendance and roster: `attendance.read` (S R T D A), `attendance.punch` (S), `attendance.punch.manual` (R T A), `attendance.regularize.approve` (R T A), `attendance.policy.manage` (A), `attendance.lock` (A), `roster.read` (S R T D A), `roster.edit` (R T D A), `roster.publish` (T D A), `shift.manage` (A).
- Timesheets: `timesheet.read` (S R T A), `timesheet.submit` (S), `timesheet.approve` (R T A or project manager), `project.manage` (A or own), `project.rates.read` (A).
- Recruitment: `requisition.create` (R T D A), `requisition.approve` (A), `posting.manage` (A), `candidate.read` (A, or assigned), `candidate.compensation.read` (A), `candidate.anonymize` (A), `interview.schedule` (A), `scorecard.submit` (assigned), `scorecard.read.all` (A), `offer.manage` (A), `offer.approve` (A), `referral.create` (S).
- Onboarding and offboarding: `onboarding.manage` (A), `onboarding.task.complete` (assigned), `offboarding.initiate` (S R A), `offboarding.manage` (A), `exit.interview.read` (A).
- Documents: `document.read` (S R A), `document.upload` (S A), `document.verify` (A), `template.manage` (A), `letter.generate` (A), `signature.request` (A), `policy.manage` (A), `confidential.document.read` (A).
- Payroll: `payroll.read` (A), `payroll.run.manage` (A), `payroll.run.approve` (A), `payroll.run.finalize` (A), `payroll.config.manage` (A), `payslip.read` (S, A), `payslip.publish` (A), `loan.manage` (A), `declaration.verify` (A), `fnf.manage` (A).
- Expenses: `expense.create` (S), `expense.read` (S R T A), `expense.approve` (R T A), `expense.pay` (A), `expense.config.manage` (A).
- Performance: `goal.read` (S R T A), `goal.manage` (S R A), `cycle.manage` (A), `review.read` (S R A), `calibration.manage` (A), `feedback.give` (S), `succession.read` (A).
- Learning, engage, helpdesk, assets: `course.manage` (A), `course.assign` (R T A), `skill.verify` (R T A), `announcement.manage` (A), `survey.manage` (A), `survey.results.read` (A), `recognition.give` (S), `ticket.create` (S), `ticket.work` (team), `ticket.confidential.read` (restricted team), `kb.manage` (A), `asset.read` (S A), `asset.manage` (A), `asset.request` (S).
- System: `audit.read` (A), `settings.manage` (A), `data.export` (A), `data.restore` (A), `workflow.manage` (A), `report.read` (scope by data), `report.build` (A or scope), `outbox.send` (A).

**Default role grants (summary).**

| Role | Grants |
| --- | --- |
| Employee | All S keys listed above, directory read of limited fields, `leave.request.create`, `attendance.punch`, `timesheet.submit`, `expense.create`, `ticket.create`, `asset.request`, `referral.create`, `feedback.give`, `recognition.give` |
| Manager | Employee plus R and T scope for read and approve keys in time off, attendance, timesheets, expenses, goals, reviews, roster edit, course assign, offboarding initiate |
| HR Officer | A scope read on employees (no salary, bank, ID, medical), time off, attendance, recruitment, onboarding, offboarding, documents, learning, engage, helpdesk; create and update employees; manage leave balances and templates; no payroll |
| HR Administrator | HR Officer plus salary, bank, ID read, role and account management, settings, data, workflow, review cycles, calibration, View as, purge, merge |
| Payroll Administrator | Employee plus all payroll keys, `salary.read` A, `bank.read` A, attendance read A, `leave.balance.adjust` limited to encashment, expense pay |
| Recruiter | Recruitment keys except offer approve and compensation unless granted; careers site management; read limited employee directory |
| Hiring Manager | `requisition.create`, read candidates for own requisitions, `scorecard.submit`, interview scheduling for own postings |
| Finance Approver | `expense.approve` A, `payroll.run.approve`, `offer.approve`, read payroll summaries without per-employee salary unless granted |
| Asset Manager | Asset keys A, maintenance, audits, labels |
| Auditor | Read only on A scope, `audit.read`, no salary or private fields unless granted, no writes of any kind |
| Administrator | All keys, all scopes |
| New joiner | Own onboarding tasks, own documents upload, policies marked for joiners, own profile |

Seed these grants as data in the default roles; the permission tests iterate this table.

---

## Appendix B. Reference mapping (why each part exists)

| Source product feature | Where it lives here |
| --- | --- |
| Odoo Employees, departments, org chart, contracts, skills | H2, H14 |
| Odoo Time Off (accrual plans, allocations, approvals, team calendar) | H3, H18 |
| Odoo Attendances, Zoho attendance and geofencing | H4 |
| Odoo Planning, Zoho Shifts | H5 |
| Odoo and Zoho Recruit (pipeline, job posts, interviews, offers, referrals) | H6 |
| Odoo onboarding and offboarding plans, Zoho onboarding and exit | H7, H13 |
| Zoho documents, letters, e-sign, policies and acknowledgements | H8 |
| Odoo and Zoho timesheets and projects | H9 |
| Odoo Payroll (structures, rules, payslips), Zoho Payroll (statutory, FNF, declarations) | H10 |
| Odoo Expenses, Zoho Expense | H11 |
| Odoo Appraisals, Zoho Performance (goals, 360, 1 on 1s) | H12 |
| Zoho Learn and Odoo eLearning, certifications | H14 |
| Zoho engagement (announcements, surveys, recognition) | H15 |
| Zoho case management, Odoo helpdesk | H16 |
| Odoo Equipment, Zoho Assets | H17 |
| Odoo chatter and activities | SRB7 |
| Odoo and Zoho approval and workflow automation | P4, P11 |
| Zoho custom fields and forms, Twenty metadata-driven fields | P9 |
| Odoo and Zoho reports and dashboards | H19, H1 |

