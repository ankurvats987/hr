# Mobile table overflow

Responsive UX review should measure document width at 360px because a table wrapper without overflow containment can silently expand the whole page.

## What Happened

In hr/t5-re-review, the People route rendered a 543px table at a 360px viewport while `.table-wrap` had `overflow-x: visible`, producing a 560px document. The table remained usable only through page-level horizontal scrolling.

## Takeaway

For responsive data tables, verify a deliberate horizontal scroller or card transformation and that `document.body.scrollWidth` does not unexpectedly exceed the viewport.

## History

- 2026-11-03 (hr/t5-re-review): initial
