---
name: formal-verify-generator
description: "Use when concurrency, retries, distributed state machines, idempotency locks, or permission invariants exceed normal unit test reach to generate a project-local formal verification skill under .agents/skills/ using TLA+ and /statechart."
---

# Formal Verification Generator

Unit tests verify examples you remembered to write; model checkers explore **every interleaving and reachable state** within bounded scope. Identify the highest-risk promise in the codebase (races, lost updates, idempotency leaks, invalid transitions), verify one crisp invariant, and package a repeatable `.agents/skills/formal-verify-<area>/` skill so future changes stay checked (`EP-01`, `EP-06`, `EP-08`).

## 1. Pick Target & Tool
- Inspect codebase concurrency, queues, locks, webhooks, payment/auth state machines (`GEMINI.md` + source handlers). Pick the promise where a subtle interleaving bug harms users most.
- Default to **TLA+ / TLC** via `skills/statechart/SKILL.md` and `commands/invoke-statechart.ps1` for concurrency, protocol, and state-machine ordering bugs; choose a code-level SMT/property verifier when modeling pure data-structure memory bounds.

## 2. Modeling Rules
1. **True to Code**: Map every atomic TLA+ step directly to one indivisible block in production code (`file:line` cited inside the generated skill).
2. **Must Be Able to Fail (`EP-01`, Fault Injection)**: Deliberately test a broken variant (e.g., omit a lock or reorder a check) and confirm the model checker catches the counterexample BEFORE trusting green.
3. **Never Weaken Failing Properties**: If current production code breaks the invariant, report the shortest counterexample path in plain words — do not relax the invariant.
4. **Honest Bounds & Commit Sync**: Document model bounds, excluded external assumptions, and record `Sync Commit: <git SHA>` alongside covered `target_files`.

## 3. Generate `.agents/skills/formal-verify-<area>/SKILL.md`
Include YAML frontmatter, covered files + `Sync Commit`, plain-English statement of the property & harm, one command invoking `skills/statechart/SKILL.md` (`commands/invoke-statechart.ps1`) by name without hardcoding internal plugin binaries, and guide the next agent to `skills/formal-verify-maintainer/SKILL.md` if covered files changed.
