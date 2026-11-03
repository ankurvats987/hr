# JavaScript Vite Baseline

The HR rewrite is intentionally constrained to the existing JavaScript React/Vite browser environment.

## What Happened

For t2, the clarification override was applied over the older TypeScript instruction in the build specification. The existing package already had React 19, Vite 8, and working `lint` and `build` scripts, so no dependency or source changes were needed.

## Takeaway

Use the existing `.jsx`/`.js` toolchain and preserve `npm run lint` plus `npm run build` as the mandatory batch gates; do not introduce TypeScript or backend dependencies.

## History

- 2026-11-03 (hr/t2): initial

