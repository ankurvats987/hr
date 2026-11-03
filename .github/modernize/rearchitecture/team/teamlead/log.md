## [t2] Prepared JavaScript React/Vite browser environment
- Codebase/domain discoveries: `package.json` already provides React 19.3.1, Vite 8.3.5, and the required `lint`/`build` scripts; the browser baseline passes both commands.
- Wrong assumptions and corrections: the authoritative spec requests TypeScript, but the clarification explicitly overrides this to JavaScript; downstream work must follow the override.
- Debugging dead-ends and what actually worked: `Get-Date -AsUTC` is unsupported in this PowerShell version; `[DateTime]::UtcNow` provided the UTC timestamps.
- Techniques/patterns worth reusing: validate the existing package scripts before changing dependencies; keep environment preparation separate from frontend source ownership.
- Learnings consumed: [(none)]

## [t8] Confirmed scoped specification conformance
- Codebase/domain discoveries: The implemented route table matches the architect-approved minimum runnable boundary; deferred HR modules are absent rather than represented by placeholders. IndexedDB is the primary persistence path behind `src/api/index.js`.
- Wrong assumptions and corrections: The long-term specification lists many modules, but the clarification and architect boundary explicitly authorize a JavaScript/local-only core batch. Full H1–H19/P1–P11 delivery must not be conflated with this scoped PASS.
- Debugging dead-ends and what actually worked: `npm run dev -- --port 5199` passed `5199` as a Vite root and returned 404; invoking `npx vite --host 127.0.0.1 --port 5199` produced the correct HTTP 200 readiness check.
- Techniques/patterns worth reusing: Classify upstream partial browser evidence as MEDIUM follow-up when source logic and adjacent workflow evidence support the behavior; keep the binary gate PASS/FAIL and state scope explicitly.
- Learnings consumed: [teamlead/javascript-vite-baseline]
