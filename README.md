# Kestrel HR Demo — Feature Summary

## What is included

- **Home dashboard** — Shows attendance status, leave balance, task progress, approvals, and recent activity.
- **People** — Search the employee directory, view employee records, add employees, edit details, and export CSV.
- **Tasks** — Employees see their own assigned tasks. Managers and HR admins can filter tasks by employee and assign new tasks. Only the assigned employee can complete a task.
- **Time off** — Employees submit leave requests and track their status. Managers and HR admins can review and approve or reject requests.
- **Attendance** — Employees can check in and out and view their own attendance history.
- **Timesheets** — Employees submit time entries with notes. Managers and HR admins can review submitted entries.
- **Recruitment** — Add candidates, move them through hiring stages, and convert hired candidates into employee records.
- **Onboarding** — Complete onboarding checklist items for the active employee.
- **Payroll** — HR admins can create payroll runs, review totals, lock a run, and export CSV.
- **Role-based views** — Employee, manager, and HR admin personas see different navigation items and actions.
- **Local persistence** — Data is saved in the browser using IndexedDB, with localStorage fallback.
- **Setup and demo data** — The app starts with a sample Kestrel Works workspace and editable records.
- **Material-inspired UI** — Responsive layout, dialogs, forms, tables, status indicators, and mobile navigation.

## How it works

Use the account menu to switch between the employee, manager, and HR admin personas. Changes are saved locally in the browser, so the workflows can be tested without a backend.

Employees manage their own leave, attendance, timesheets, onboarding, and tasks. Managers handle team-level reviews and task assignment. HR admins can access people administration, recruitment, payroll, and workspace-wide task and request views.

## Not included yet

- Real authentication or server-side authorization
- Backend API, shared database, or multi-user synchronization
- Statutory tax calculations, payslips, bank payments, or payroll filings
- Email, calendar, HRIS, or external payroll integrations
- Production-grade reporting and analytics
- Binary document uploads, e-signatures, and full document management
- Full help desk, performance reviews, announcements, automations, and offboarding workflows
- Automated browser test suite

This is a functional local demo rather than a production HR system.
