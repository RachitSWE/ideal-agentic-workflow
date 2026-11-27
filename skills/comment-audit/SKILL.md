---
name: comment-audit
description: "Use after S6 coding and before S8 code review to run an independent comment-hygiene and suppression audit using git history verification, deleting narration comments while turning valid constraints into code/types/lints."
---

# Comment Audit

Run `agents/comment-hygiene-reviewer.md` on the modified diff BEFORE submitting to `S8 Code Review` so verbose narration (`AP-002`), commented-out corpses, unsafe lint suppressions (`AP-004`), and disguised workaround apologies are cleaned at the structural source (`EP-04`, `EP-12`).

## Protocol

1. **Spawn Independent Auditor (`invoke_subagent`)**:
   - Pass only the diff or `target_files` under review to `agents/comment-hygiene-reviewer.md`.
   - The reviewer produces a read-only audit report identifying removable narration comments, unsafe compiler/lint suppressions (`@ts-ignore`, `@SuppressWarnings`, `eslint-disable`), and `MUST REFACTOR` workaround targets backed by `git log -S` / blame checks.
2. **Verify Keep Exceptions Carefully**:
   - Preserve ONLY comments proven via source + `git log -S` to document: legal headers, public API contract docstrings, issue/RFC links for constraints code cannot express, or verified external vendor/protocol quirks we cannot change.
   - Delete narration comments ("Added helper", section banners, restating variable names) and dead commented-out blocks outright.
3. **Encode Valid Constraints (`EP-12`)**:
   - For genuine `do not remove` / fragile-invariant warnings on our own code, replace prose comments with a concrete type, runtime assertion, automated test, or lint rule whenever feasible, then remove the workaround comment.
4. **Handoff Summary**:
   - Record deleted comment count, preserved exception justifications, remediated suppressions, and structural refactors before running `S7` + `S8`.
