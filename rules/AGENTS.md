# Agent Behavioral Rules & Invariant Charter (`ideal-agentic-workflow` v2.0)

These rules are loaded globally on every session. Enforce them strictly alongside project-specific `GEMINI.md` and detected stack rules (`resources/stack-rules/`).

---

## 1. Active Layer Map & Startup Dispatch (Mandatory Turn-1 Protocol)

When this plugin is active, **five coordinated layers** govern the workspace:
1. **Project Truth (`GEMINI.md`)**: Repository architecture, pinned stack (`§2.3`), and open features. Read in full before opening source files (`skills/s0-repo-architect/SKILL.md` creates one if missing).
2. **Core Charter (`rules/AGENTS.md`)**: Universal Anti-Patterns (`AP-001..AP-010`), Engineering Principles (`EP-01..EP-12`), strict modularity laws, and quarantine boundaries.
3. **Orchestrator Router (`skills/s1-orchestrator/SKILL.md`)**: Mandatory entry skill dispatching every request into the right track:
   - *Features / Migrations / Multi-file Arch*: **Standard Track (`S2 -> S11`)** or **Spec Track (`SP1 -> SP6`, `skills/spec-architect-pipeline/SKILL.md`)** (Strict Plan & LGTM Gate before code).
   - *Empirical Fast-Tracks*: **`bugfix-mode`** (live repro first), **`perf-hillclimb-mode`** (baseline + `skills/benchmark-audit/SKILL.md`), **`prototype-mode`** (throwaway check), **`investigation-mode`** (read-only), **`refactor-mode`**, **`autonomous-mode`** (+ `skills/decision-log/SKILL.md`).
   - *Fast / Trivial / Duolithic*: `/fast mode` (<=3 files, <=100 LOC), `/trivial` (docs only), `/duolithic mode` (external R-Agent).
4. **On-Demand Stack Rules (`resources/stack-rules/rules-*.md` + `resources/stacks/`)**: Resolved per project via `SessionStart` hook / `resources/stacks/_stack-composer.md` and read ONLY for detected stacks.
5. **Verification, Review & Evolution Gates**: `S7` 5-Tier + Fault Injection + `skills/statechart/SKILL.md` (TLA+ concurrency/state models), `S8` Execution-Proven Review (`skills/adversarial-review/SKILL.md` + `skills/comment-audit/SKILL.md`), `S10` Batch Auto-Commit (`commands/auto-commit.ps1`), and `S11` Repo Hardening (`skills/repo-hardening/SKILL.md`).

- **Turn-1 Rule**: If asked what rules/workflow apply, report all 5 layers plus detected `GEMINI.md` & matching `resources/stack-rules/` files accurately. Before investigating or modifying code in any engineering task, load `skills/s1-orchestrator/SKILL.md` (even if the user did not paste `INVOCATION.md`).

---

## 2. Anti-Patterns (`AP-001` through `AP-010`)

- **AP-001 Simulation/Mocks in Production**: No dummy payloads, fake delays, or "Local Demo" escape hatches in prod paths.
- **AP-002 Conversational & Vibe Comments**: Zero "Added as per task" narration; comments only explain non-obvious *why* (audited by `skills/comment-audit/SKILL.md`).
- **AP-003 Stubs & Placeholders**: No `TODO`, `FIXME`, `pass`, or empty handlers in committed code.
- **AP-004 Compiler/Linter Appeasement**: Zero `any`, `@ts-ignore`, `@ts-nocheck`, `@SuppressWarnings`, blanket `except Exception: pass`, or `#[allow(dead_code)]`.
- **AP-005 Blind Bulk Staging**: Never run bare `git add .` / `git add -A`. Use `commands/auto-commit.ps1` (`scripts/auto-commit.mjs`) or `commands/stage-commit.ps1` Mode A / Mode B `-Scaffold`.
- **AP-006 Context Exhaustion**: Pass file paths and `commands/measure-diff.ps1` summaries to subagents, not huge pasted files.
- **AP-007 State Quarantine**: Keep all session state inside `.agents/session-[SHA]/` (or `.agents/specs/session-[SHA]/`), never polluting project root.
- **AP-008 Destructive Doc Edits**: Never delete or rewrite human-authored `GEMINI.md` sections; update incrementally.
- **AP-009 Unread Context Execution**: Before acting in any active phase, read `GEMINI.md`, the active track/phase `SKILL.md`, and ONLY the detected `resources/stack-rules/rules-*.md` once per phase transition.
- **AP-010 Main Agent Self-Review Fabrication**: Main orchestrator is strictly read-only on `code-review/review/*.md` and `audit/bin/*.md`. Independent subagents author all verdicts.

---

## 3. Core Engineering Principles (`EP-01` through `EP-12` — Index)

Full definitions live in [`resources/engineering-principles.md`](../resources/engineering-principles.md):

| ID | Principle | Core Directive |
| :--- | :--- | :--- |
| **EP-01** | **Prove It Works** | Run real artifact/E2E flow; new checks must fail on broken variant first (fault injection). |
| **EP-02** | **Fix Root Cause & Attack Premise** | Trace to origin; if 2 fixes sharing one premise fail, stop and test the premise directly. |
| **EP-03** | **Subtract Before Adding** | Delete dead code & single-caller wrappers first while **keeping strict OOP/JSX file boundaries**. |
| **EP-04** | **Foundational Data Shapes** | Define types, schemas, and state machines (`skills/statechart/`) before control flow. |
| **EP-05** | **Boundary & Type Discipline** | Validate external data at boundaries; share parser/contract types across subsystems. |
| **EP-06** | **First-Principles Convergence** | Redesign cleanly rather than bolting patches; migrate callers and delete legacy shims in one wave. |
| **EP-07** | **Exhaust Design & Build the Lever** | Sketch/arena (`design-architect`, `solution-arena`) on forks; script repetitive work. |
| **EP-08** | **Separate State & Idempotence** | Isolate parallel work (worktrees/branches) before locking; make scripts safely retryable. |
| **EP-09** | **Verifiable Units & UX First** | Sequence atomic checked steps; prioritize user/developer experience over shortcuts. |
| **EP-10** | **Test Behavior, Not Internals** | Verify observable user journeys end-to-end across modules rather than synthetic isolated mocks. |
| **EP-11** | **Explain Numbers & Guard Context** | Vet every metric (`benchmark-audit`) for limiters/bounds/variance; keep main context lean. |
| **EP-12** | **Proceed & Harden Structure** | Act without blocking on reversible work; fix repeat mistakes in repo code/lints (`repo-hardening`), docs last. |

---

## 4. Lifecycle Invariants, Commit Standard & Universal Senior Standards

- **Option A Gate Discipline**: For `Standard` / `Spec` features, never edit production code before `plan.md` + `task.md` pass `S4` unanimous `LGTM`; never run `S8` while `S7` fails; enforce 2-round review circuit breaker (`skills/s8-code-review/`). Verify Scope Jail at Gate 4 via `commands/verify-scope.ps1` (expand legitimately with `commands/escalate-scope.ps1`).
- **Execution-Backed Review (`S8`)**: Reviewers attack the goal across callers/writers/UI wiring; findings for bugs/regressions survive only with live command/test failure proof (`skills/adversarial-review/SKILL.md`).
- **Commit Standard (`S10`)**: Prefer `commands/auto-commit.ps1` (or `commands/stage-commit.ps1`). Conventional Commit `<type>(<scope>): <imperative subject>` (`<= 72` target / `<= 100` hard cap, lowercase prefix, preserve exact `PascalCase`/`camelCase` code identifiers, no trailing period); mandatory body (`<= 150` target / `<= 180` hard cap, preserve identifier casing, prefix `atomic:` when a cohesive single file exceeds 150 LOC).
- **Strict Structural & UI Invariants (Zero Exceptions)**:
  1. **Strictly 1 Type Per File in OOP**: Every production class, interface, record, enum, or custom exception in OOP stacks (Java, C#, etc.) resides in its own dedicated file matching its name; no nested/inner/multi-type production files.
  2. **1:1 Route Mirroring & Decomposition Ceiling**: `src/app/` routes pair `layout.tsx` + `page.tsx`; mirror route UI/API 1:1; every `.tsx` defines `<= 1` primary component with `<= 2` (`<= 2 inline JSX` children) nested elements.
  3. **Security & Auth**: Quarantine intermediate tokens (`<= 5` min, single-use JTI in distributed cache + fallback); zero client secret prefixes (`NEXT_PUBLIC_` etc.); hierarchical fail-closed privilege checks (no admin self-deletion).
  4. **Frontend & Persistence**: Synchronize dirty forms (`isDirty` + unsaved warning); atomic `isRefreshing` 401 token mutex; WCAG 2.2 AA (`44x44` targets, `:focus-visible`, `prefers-reduced-motion`); concrete DTO deserialization; virtual-thread non-pinning (`ReentrantLock`); migration-first schemas (`ddl-auto: validate`); Redis TTLs & sliding-window limits.
  5. **Layout Geometry, Portals, Probes & Domain Profiles**: Mount portals/modals outside transformed containing blocks (`createPortal` / `<dialog>`); use `touch-action: pan-y`/`none` + W3C Pointer Events + 10px drag threshold; verify daemons >= 3s unmocked; enforce 1:1/16:9 aspect geometry. For Discord bot / OpenType canvas apps, load optional [`resources/stacks/discord-bot-customizer.md`](../resources/stacks/discord-bot-customizer.md).
