# npm Transitive Dependency Overrides

For browser-only npm applications, a lockfile-resolved transitive advisory can be patched with a minimal `overrides` entry and a regenerated lockfile.

## What Happened

Task t9 found `minimatch@10.2.6` through the npm CVE assessment, with a recommended fix of `11.0.1`. Adding `overrides.minimatch` and running `npm install` upgraded only the vulnerable transitive package and its required child.

## Takeaway

Prefer an npm override for transitive CVEs when no direct application dependency upgrade is needed; always re-run both the shared CVE scan and `npm audit`, followed by project lint/build/test.

## History

- 2026-11-03 (hr/t9): initial
