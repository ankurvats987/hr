# HR Demo

HR Demo is a browser-only people operations prototype for Kestrel Works. It uses sample data to demonstrate employee records, time off, attendance, requests, onboarding, hiring and guided workflows.

## Run locally

```bash
npm install
npm run dev
```

The demo stores changes in `localStorage` and does not require an account or server. Use the persona menu in the top-right to switch between Isha Verma (Employee), Rohan Kapoor (Manager) and Meera Iyer (HR Admin). The first-visit welcome dialog and Guide explain the main workflow.

## Validation

```bash
npm run lint
npm run build
```

## Simplified in this demo

This is sample data rather than a production HR system. It does not include authentication, server-side persistence, payroll calculation, real email delivery or external integrations.
