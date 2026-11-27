# Universal Engineering Principles (EP-01 through EP-12)

This charter integrates empirical, subtractive, and verification-first engineering principles into `ideal-agentic-workflow` alongside `AP-001..AP-010`.

> **Modularity Compatibility Guarantee:** Applying `EP-03` (subtracting dead wrappers / keeping changes minimal) **never overrides** `AGENTS.md §7.1 & §7.3` (**1 OOP type per file** and **<= 2 inline JSX children per `.tsx` file**). Subtract bloat, dead branches, speculative abstractions, and one-caller indirection—while preserving clean file-level and component-level decomposition.

---

## Core & Design Principles

### EP-01: Prove It Works (No Proxy Claims)
- **Trigger:** Before claiming any fix, feature, speedup, or check is done.
- **Rule:** Verify against the real running artifact (executed test, live command output, real DB state, browser observation), never "it compiles" or mocked proxies alone. Newly written assertions must be seen failing on a broken variant first (fault injection / TDD Red-Green).

### EP-02: Fix Root Causes & Attack the Premise
- **Trigger:** Debugging failures, or whenever 2+ fix attempts sharing the same premise fail the same gate.
- **Rule:** Trace symptoms backward to the first wrong state/assumption and fix there rather than bolting on symptom guards. If two fixes assuming premise X both fail, stop, write down X explicitly, and test X directly before writing a third fix.

### EP-03: Subtract Before You Add & Laziness Protocol
- **Trigger:** Refactoring, scoping diffs, or tempted to introduce helpers, feature flags, or abstraction layers.
- **Rule:** Remove dead code, legacy compatibility shims, unused config flags, and single-caller wrapper layers *first*, then build the smallest clean change on the simpler base. Minimize reader cognitive load (layers between question and answer, hidden mutable state) without collapsing deliberate OOP/JSX file boundaries (`1 type/file`, `<= 2 inline JSX children`).

### EP-04: Foundational Data Shapes & Domain Modeling
- **Trigger:** Designing stateful workflows, permissions, parsers, or branching logic repeated across files.
- **Rule:** Pick core types, immutable schemas, state tables, or finite state machines *before* writing control flow. When state transitions have tricky concurrency/ordering invariants, check the design formally (`skills/statechart/SKILL.md`).

### EP-05: Boundary & Type-System Discipline
- **Trigger:** Parsing external inputs (CLI flags, HTTP payloads, config files, env vars, AI JSON) or sharing data across modules.
- **Rule:** Validate and normalize untrusted data cleanly at the system boundary; make illegal states unrepresentable with strict types/enums/parsers; keep core business logic pure and total. Never pass hand-formatted ad-hoc strings across subsystems when a shared parser/contract can enforce structure.

### EP-06: First-Principles Redesign & Outcome-Oriented Convergence
- **Trigger:** Integrating a major new requirement or executing multi-phase migrations.
- **Rule:** Design as if the new requirement had existed from day one instead of bolting patches onto old assumptions. Migrate all callers and delete legacy APIs/shims in the same wave rather than carrying throwaway compatibility layers.

### EP-07: Exhaust Design Space & Build the Lever
- **Trigger:** Ambiguous high-stakes architecture forks or repetitive/error-prone manual operations.
- **Rule:** Prototype/sketch 2+ concrete shapes (`skills/design-architect/SKILL.md`) or run competing candidates (`skills/solution-arena/SKILL.md`) before committing. For repetitive sweeps or verification (migrations, batch commits, AST scans, app harnesses), build a deterministic script/tool (`commands/auto-commit.ps1`, `verify-*`) instead of error-prone manual execution.

## Concurrency & Execution Principles

### EP-08: Separate Shared State & Idempotent Operations
- **Trigger:** Parallel workers/subagents (`arena`, `interrogate`, `swarm`) or lifecycle/retry scripts.
- **Rule:** Eliminate shared mutable state (use isolated worktrees/branches or dedicated output paths) before introducing locks. Design commands, hooks, and lifecycle scripts so partial retries converge idempotently to the same end state.

### EP-09: Sequence Verifiable Units & Experience First
- **Trigger:** Multi-step features, UX tradeoffs, and commit staging.
- **Rule:** Break work into small atomic increments that each end in a runnable check (`verify-scope.ps1` + tests + `S10`). When implementation convenience conflicts with user/developer experience (obscure errors, missing UI controls, rough edge flows), optimize for user delight.

## Verification, Performance & Evolution Principles

### EP-10: Test Behavior, Not Implementation
- **Trigger:** Writing, modifying, or reviewing unit, integration, or E2E tests.
- **Rule:** Assert observable outcomes and external contracts (end-to-end user journeys, API results, persisted state) so tests fail when real behavior breaks and stay green across internal refactors—never mirror private mocks blindly.

### EP-11: Explain Every Measured Number & Guard Context
- **Trigger:** Reporting any latency/throughput/eval metric (`skills/benchmark-audit/SKILL.md`), or handling large diffs/transcripts.
- **Rule:** Before trusting or citing any measurement, find the physical limiter, verify >=5 alternating runs, inspect error counts, and rule out dead-code elimination or warm-cache artifacts. Protect main context by passing subagents file paths instead of pasting giant files.

### EP-12: Proceed on Reversible Work & Encode Lessons in Structure
- **Trigger:** Reversible local tasks, or noticing an agent/contributor repeat the same mistake twice.
- **Rule:** Do not block waiting on the human for reversible exploration, local checks, or clear next steps (pause only for destructive/irreversible actions like force-pushes, production deploys, or deleting external state). When a mistake repeats, fix it at the highest durable layer (`skills/repo-hardening/SKILL.md`): **Architecture -> Types -> Lint -> Behavioral Test -> Docs last** ("nothing fails when an agent skips a prose rule").
