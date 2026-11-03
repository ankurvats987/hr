## [t9] Remediated npm dependency CVE
- Codebase/domain discoveries (gotchas, non-obvious behavior): The only reported advisory affected transitive `minimatch`; npm's override mechanism is appropriate for keeping the application dependency set unchanged.
- Wrong assumptions and corrections: `npm audit` surfaced multiple moderate dependency paths, but the authoritative advisory scan identified one actionable minimatch CVE; final npm audit was clean after the override.
- Debugging dead-ends and what actually worked: No dead-end; `npm install` regenerated the lockfile and resolved the advisory.
- Techniques/patterns worth reusing for future tasks: Use the shared CVE assessment plus `npm audit`, then verify with lint/build/test.
- Learnings consumed: [(none)]
