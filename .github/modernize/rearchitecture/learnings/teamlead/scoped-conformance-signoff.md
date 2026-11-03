# Scoped Conformance Signoff

When a clarification authorizes a reduced runnable boundary, conformance must distinguish shipped-scope acceptance from the full future product specification.

## What Happened

For t8, the specification listed the complete HR product, while the clarification and architect artifact authorized a JavaScript/local-only core with unfinished modules omitted from navigation. The final gate passed because the shipped boundary was complete and functional, while deferred modules and medium follow-ups were explicitly documented rather than silently treated as delivered.

## Takeaway

Use a binary PASS/FAIL verdict, but state the scope in the verdict. A scoped PASS is valid only when deferred capabilities are absent from routes/navigation, required lint/build/startup/browser evidence passes, and every remaining gap has an owner and severity. Never claim full product parity when only the minimum runnable boundary shipped.

## History

- 2026-11-03 (hr/t8): initial
