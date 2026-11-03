# t9 — Dependency CVE remediation

## Summary

Scanned the npm dependency set for the browser-only React/Vite application and remediated the one actionable advisory found. The transitive `minimatch` dependency was forced to patched version `11.0.1` with an npm `overrides` entry; npm regenerated the lockfile. No application source or runtime scope was changed.

## Upstream Artifacts Consumed

- `.github/modernize/rearchitecture/artifacts/t4-frontend.md` — implementation manifest scope and prior lint/build evidence.
- `.github/modernize/rearchitecture/clarification.md` — browser-only JavaScript/Vite scope; no backend or database dependency expansion.

## Evidence Mapping

- `t4-frontend.md#Changed Files` → `package.json` and `package-lock.json` were the only dependency manifests changed.
- `clarification.md#Generic` → remediation stayed within npm/browser-local scope and did not add backend services.
- `cve-report-1.json` → `CVE-2026-118764` on `minimatch@10.2.6`, recommended `11.0.1`; addressed by the `overrides.minimatch` entry.
- `final-cve-report.json` / `cve-report-2.json` → final scan returned an empty findings array.

## Scan Evidence

- Scanner: `appmod-cve-assessment` using the npm ecosystem and resolved/direct coordinates from `package-lock.json`/`package.json`.
- Initial report: `cve-report-1.json`.
- Initial finding: `CVE-2026-118764` (medium), minimatch globparts amplification denial of service; affected `minimatch@10.2.6`.
- Independent local check: `npm audit --json` initially reported 6 moderate vulnerability paths, including the same minimatch advisory and no high/critical findings.

## Changes

- Added `"overrides": { "minimatch": "11.0.1" }` to `package.json`.
- Regenerated `package-lock.json`; `node_modules/minimatch` is now `11.0.1` and includes its patched transitive dependency.
- No major framework or application dependency upgrades were performed.

## Verification

- `npm install` — passed; lockfile regenerated and npm reported 0 vulnerabilities.
- `appmod-cve-assessment` final scan — passed; no known CVEs (`cve-report-2.json` and `final-cve-report.json` contain `[]`).
- `npm audit --json` — passed; 0 total vulnerabilities (0 info/low/moderate/high/critical).

## Test Results

- Command: `npm run lint`
  - Passed: 1
  - Failed: 0
  - Skipped: 0
- Command: `npm run build`
  - Passed: 1 production build
  - Failed: 0
  - Skipped: 0
- Command: `npm test`
  - Passed: 1 configured smoke command
  - Failed: 0
  - Skipped: 0 (the project has no automated test suite)

## Follow-ups

None. The actionable advisory is cleared, and no unfixable or major-version follow-up remains for this scan.
