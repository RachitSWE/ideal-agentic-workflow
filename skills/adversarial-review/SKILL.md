---
name: adversarial-review
description: "Use before merging or finishing non-trivial code or design changes to attack the stated intent with live reproduction commands, keep only execution-proven bugs, and drop theoretical nitpicks."
---

# Adversarial Review

Skeptical, execution-backed interrogation of code diffs or architectural plans. Findings for bugs, regressions, or broken invariants **survive ONLY when backed by a live failing run** (`EP-06`, `EP-10`). Theoretical edge cases that require unrelated future edits, naming preferences, and unrun hypotheses are dropped.

## Protocol

1. **Frame Scope & User Intent**:
   - Identify the diff or changed files (plus their callers, persistence writers, and UI consumers).
   - Restate the exact behavioral contract in one sentence before spawning adversaries.
2. **Spawn Isolated Adversaries (`swarm` / `invoke_subagent`)**:
   - Launch `agents/adversarial-falsifier-reviewer.md` (paired with domain reviewers from `skills/s8-code-review/resources/task-reviewer-matrix.md` on multi-layer diffs) inside isolated workspaces (`swarm` `workspace: "branch"` or read-only inspection with temp repro scripts kept inside `.agents/session-[SHA]/code-review/review/`).
   - Keep `AP-010`: reviewers write findings only to `.agents/session-[SHA]/code-review/review/review(n).md`; the main author never writes review files.
3. **Require Live Failing Proof for Every Bug/Regression Finding**:
   - Every reported failure MUST include: finding title, exact command run, verbatim failing output, expected intent behavior, and root-cause `file:line`.
   - Drop any claim that lacks reproduction output or violates explicit user scope — do not dilute verdicts with unverified speculation. (Invariant violations caught deterministically by repo lints/AST scanners also cite verbatim scanner failure output.)
4. **Verify & Deduplicate**:
   - Independently re-run surviving repro commands to confirm reproducibility; merge findings sharing a single root cause.
5. **Structured Verdict Output**:
   - **Intent**: restated behavioral goal.
   - **Verified Findings**: table + repro command/output per confirmed break (or `No verified findings`).
   - **Dropped Claims**: count per adversary + concise reason (`unverified`, `style nitpick`, `unreachable guard`, `duplicate`).
