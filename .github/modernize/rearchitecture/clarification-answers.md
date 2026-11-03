---
schema: clarification-answers/v1
status: draft
generated_at: "2026-11-03T02:42:51.890Z"
scope: [frontend, backend, generic]
questions_file: clarification-questions.json
---

# Rearchitecture Clarification Answers

> DRAFT — the user has not submitted yet. Do NOT consume these answers.

## 🖥️ Frontend

- **F1** Which target frontend framework and version should the rewritten HR application use?
  - answer: React 19 + TypeScript + Vite
  - source: user
- **F2** What component library or UI control system should the new HR frontend use?
  - answer: Material UI
  - source: user
- **F3** Which screenshots or URLs document the current UI that must be preserved?
  - answer: the ui
  - source: user
- **F4** What design system, token source, or visual fidelity target should guide the rewrite?
  - answer: The authoritative hr-app-build-spec-v2.md and existing prototype
  - source: user
- **F5** Which accessibility standard should the application target?
  - answer: WCAG 2.1 AA
  - source: user
- **F6** Which browser and runtime targets must be supported?
  - answer: modern evergreen
  - source: user
- **F7** What responsive layout strategy should the application use?
  - answer: Responsive desktop-first with mobile support
  - source: user
- **F8** Which internationalization locales should be supported?
  - answer: preserve current locales
  - source: default applied
- **F9** Which client-side state management approach should the rewrite use?
  - answer: local-first service layer requested; exact library not specified
  - source: user
- **F10** Which routing library and URL strategy should be used?
  - answer: framework default
  - source: user

## ⚙️ Backend

- **B1** What target framework or runtime should the API/service layer use?
  - answer: Frontend-only TypeScript service layer with IndexedDB
  - source: user
- **B2** How should existing behavior and service contracts be preserved during the rewrite?
  - answer: preserving working behavior; API/service layer required
  - source: user
- **B3** How should existing localStorage data migrate to the IndexedDB-backed architecture?
  - answer: IndexedDB-backed replacement requested while preserving working behavior
  - source: user
- **B4** What authentication and workspace setup approach should the local-first app use?
  - answer: auth/setup/sample workspace explicitly requested
  - source: user
- **B5** What latency, throughput, or offline performance targets apply?
  - answer: match current production baseline
  - source: default applied

## 📋 General

- **G1** What outcome defines completion for this brownfield rewrite?
  - answer: Implement the highest-value coherent batches end-to-end, keep visible controls functional, validate each batch, and honestly document remaining gaps against hr-app-build-spec-v2.md acceptance criteria.
  - source: user
- **G2** Which items should explicitly remain out of scope for this implementation batch?
  - answer: Unimplemented modules must be removed from navigation rather than shown as placeholders; undocumented production integrations remain uncertain until specified.
  - source: user
- **G3** What testing policy should govern the rewrite?
  - answer: Validate after each coherent batch with lint/build/tests
  - source: user
- **G4** Where should the rewritten application be implemented?
  - answer: D:\hr (in place, incrementally)
  - source: user
- **G5** Are there any additional constraints for this implementation?
  - answer: Use hr-app-build-spec-v2.md as authoritative; preserve working behavior; remove unfinished modules from navigation; record uncertainty and remaining gaps honestly.
  - source: user
