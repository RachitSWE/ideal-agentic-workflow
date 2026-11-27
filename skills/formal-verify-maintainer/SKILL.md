---
name: formal-verify-maintainer
description: "Use after merges, refactors, or feature edits touch files covered by a project-local formal verification skill to detect model drift vs real code bugs, update TLA+ specs truthfully, and re-run /statechart."
---

# Formal Verification Maintainer

A passing stale model is dangerous because it proves properties about yesterday's code. Reconcile `.agents/skills/formal-verify-*/` after covered product code changes (`EP-06`, `EP-12`).

## Outcomes (Report One Per Check)
- **`in sync`** — covered code diff did not alter modeled transitions/state and the check passes.
- **`updated`** — model updated directly from current code, verified able to catch a seeded break, and passes.
- **`bug`** — updated model reflects current code truthfully and exposes a real invariant violation (deliver concrete counterexample steps; never weaken invariants).
- **`blocked`** — check could not execute cleanly (name missing tool/prerequisite explicitly).

## Maintenance Pass
1. Locate `.agents/skills/formal-verify-*/` (or run `skills/formal-verify-generator/SKILL.md` if none exists). Never edit product `src/` inside this maintenance pass unless asked to fix a confirmed bug via `bugfix-mode`.
2. Diff covered files since `Sync Commit` (`git log <sync>..HEAD -- <covered_files>`).
3. Update the TLA+ spec / harness directly from inspected code (`<= 150` line slices) whenever indivisible actions split, new writers appear, or intended contracts changed (cite test/commit proof for intentional contract shifts).
4. Re-run `commands/invoke-statechart.ps1` (`skills/statechart/SKILL.md`), verify fault detection still fails on a seeded break (then revert break), and advance `Sync Commit` only after passing verification.
