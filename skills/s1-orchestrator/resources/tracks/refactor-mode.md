# Track: Behavior-Preserving Refactor (`/refactor`)

Structural simplification, dead-code removal, and caller migration held against a pinned behavioral contract (`EP-04`, `EP-07`, `EP-09`, `EP-12`).

## Entry Criteria
- User requests cleanup, deduplication, renaming across callers, decomposing oversized modules, or replacing legacy abstractions without adding new product behavior or changing external contracts.
- Trigger keywords: `/refactor`, "clean up", "deduplicate", "split module", "migrate callers", "simplify architecture".

## Phase Overrides
- **Contract Pin First (Blocking)**: Before editing structural code, identify or write a characterization/equivalence test or baseline snapshot capturing existing behavior. Compiler types and lints alone do NOT constitute a behavioral pin.
- **Cross-Boundary Design Check**: If the refactor alters module boundaries, shared DTOs, or public interfaces, execute `skills/design-architect/SKILL.md` + `skills/blast-radius/SKILL.md` during `S3` planning and pass `S4` LGTM (`Option A`).
- **Subtract Before Adding (`EP-04`)**: Delete dead branches, unused flags, and one-caller wrappers first; flatten invalid state combinations rather than stacking compatibility shims. Migrate all callers and remove the legacy path in one coordinated wave.
- **Reader-Load Gate**: Every structural change must demonstrably reduce reader cognitive load (`skills/comment-audit/SKILL.md` to remove stale explanatory clutter after code becomes self-evident).
- **Split Discovery Rule**: If refactoring exposes a real product bug or missing feature, log it separately rather than mixing behavioral changes into a refactor diff.

## Verification Standard
- Re-run the behavioral equivalence pin + full `S7` suite (including `browser` / smoke check for UI/API reshapes) and confirm **zero behavioral delta**.
- Spot-check renames across strings, markdown citations, configs, and reflection paths (`node scripts/verify-file-citations.js` when editing plugin files).
- Pass `S8` `skills/adversarial-review/SKILL.md` (`0` compatibility shims or dead shunts left behind).

## Handoff
- Report pinned contract, structural changes, equivalence proof, removed LOC/symbols, and reader-load improvement.
- Commit ordered structural slices (`subtract` -> `reshape` -> `cleanup`) via `commands/auto-commit.ps1` or `commands/stage-commit.ps1`.
