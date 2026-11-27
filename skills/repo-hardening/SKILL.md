---
name: repo-hardening
description: "Use in S11 or whenever agents repeat the same mistake twice in a codebase to eliminate the mistake class structurally via architecture, types, lint rules, or tests first, updating docs only as a last resort."
---

# Repo Hardening (`/correct`)

When a mistake class happens repeatedly (detected via `decision.tsv`, review rejections, user corrections, or `S11` triage), do NOT dump another brittle sentence into `AGENTS.md` or `GEMINI.md` (`EP-12`). Fix the repository structure itself so the next cold-reading agent cannot commit that mistake class.

## Escalation Ladder (Pick the Highest Level That Works)

1. **Eliminate via Architecture**: Give each invariant a single owner, collapse duplicate helpers/legacy paths so callers cannot copy the wrong example, and replace hand-synced lists with one authoritative schema/source.
2. **Enforce via Types or Lint (`AP-004` Zero Tolerance)**: Make the invalid state fail compilation or add a focused repo lint/AST rule whose error points directly to the approved helper/API. If pre-existing code violates it, gate cleanly on new/modified lines.
3. **Lock With Behavioral Proof (`S7`)**: Fix or add a test that fails deterministically when the contract breaks (verified via fault injection).
4. **Update Docs/Rules LAST**: Document only irreducible judgment calls that machine checks cannot verify. Every documented rule MUST list its enforcing code/lint check — drop redundant prose rules once enforced in code.

## Verification Rule
Prove every new lint, type constraint, or test FAILS on a real past mistake (or seeded reproduction) before landing it in the repo CI and `skills/s11-gemini-update/SKILL.md` wrap-up.
