# Agent Behavioral Rules & Invariant Charter (`ideal-agentic-workflow` v2.0)

This is the authoritative full Charter mirroring `rules/AGENTS.md` (which serves as the token-lean always-inlined plugin entrypoint). Every agent, subagent, auditor, and reviewer operating within `ideal-agentic-workflow` MUST enforce these invariants alongside repository `GEMINI.md` and detected `resources/stack-rules/rules-*.md` files.

---

## 1. Active Layer Map & Startup Dispatch (Mandatory Turn-1 Protocol)

When this plugin is active, **five coordinated layers** govern every session:
1. **Project Truth (`GEMINI.md`)**: Repository architecture, pinned technology stack (`§2.3`), and open features. Read in full before opening source code (`skills/s0-repo-architect/SKILL.md` establishes it on greenfield/brownfield repos).
2. **Core Charter (`rules/AGENTS.md` / `AGENTS.md`)**: Universal Anti-Patterns (`AP-001..AP-010`), Engineering Principles (`EP-01..EP-12`), strict OOP/JSX decomposition laws, and `.agents/session-[SHA]/` quarantine boundaries.
3. **Orchestrator Router (`skills/s1-orchestrator/SKILL.md`)**: Mandatory entry skill classifying requests into the proper track:
   - *Features, Migrations, Architecture*: **Standard Track (`S2 -> S11`)** or **Spec Track (`SP1 -> SP6`, `skills/spec-architect-pipeline/SKILL.md`)** (strict planning + `S4` LGTM gate before code).
   - *Empirical Fast-Tracks*: **`bugfix-mode`** (live repro first), **`perf-hillclimb-mode`** (baseline + `skills/benchmark-audit/SKILL.md`), **`prototype-mode`** (throwaway verification), **`investigation-mode`** (read-only), **`refactor-mode`**, **`autonomous-mode`** (+ `skills/decision-log/SKILL.md`).
   - *Compact Modes*: `/fast mode` (<=3 files, <=100 LOC), `/trivial` (docs/chores only), `/duolithic mode` (external R-Agent offload).
4. **On-Demand Stack Rules (`resources/stack-rules/rules-*.md` + `resources/stacks/`)**: Resolved automatically via `SessionStart` hook (`scripts/session-bootstrap-hook.mjs`) and `resources/stacks/_stack-composer.md` ONLY for stacks present in the repository.
5. **Verification, Review & Evolution Gates**:
   - `S7`: 5-Tier verification (`commands/verify-stack.ps1`), Fault Injection (`EP-01`), dynamic app harnesses (`skills/verify-harness-generator/SKILL.md`), and TLA+ concurrency/state-machine verification (`skills/statechart/SKILL.md`).
   - `S8`: Adversarial Execution-Proven Review (`skills/adversarial-review/SKILL.md` + `skills/comment-audit/SKILL.md`) + 2-round circuit breaker.
   - `S10`: Automated Atomic Batch Commits (`commands/auto-commit.ps1` / `scripts/auto-commit.mjs`) or manual `commands/stage-commit.ps1`.
   - `S11`: Non-destructive `GEMINI.md` sync + Structural Repo Hardening (`skills/repo-hardening/SKILL.md`).

- **Turn-1 Protocol**: When asked which rules apply, state all 5 layers accurately along with detected `GEMINI.md` and matching `resources/stack-rules/` files. Before starting any engineering task, load `skills/s1-orchestrator/SKILL.md` automatically without waiting for `INVOCATION.md`.

---

## 2. The 10 Anti-Patterns of Agentic Coding (`AP-001` through `AP-010`)

Auditors (`S2`) and Reviewers (`S4`, `S8`) MUST reject any code or session artifact exhibiting:

- **AP-001 Simulation & Mock Code in Production**: Mock return values, dummy JSON payloads, simulated delays, or disguised "Local Demo" / "Preview" UI state mutations in production paths.
- **AP-002 Conversational & Vibe Comments**: Narrative AI chatter (`// Added per task`, `// Fixed null`). Comments are allowed ONLY for non-obvious *why*, audited via `skills/comment-audit/SKILL.md`.
- **AP-003 Unimplemented Stubs & Placeholders**: `TODO`, `FIXME`, `pass`, empty functions, or unimplemented branches in committed code.
- **AP-004 Compiler & Linter Appeasement Hacks**: `any`, `@ts-ignore`, `@ts-nocheck`, `@SuppressWarnings`, ESLint disable comments, blanket `except Exception: pass`, or `#[allow(dead_code)]`. Fix the root type/interface instead.
- **AP-005 Blind Bulk Staging**: Never execute blind `git add .`, `git add -A`, or `git add --all`. Use `commands/auto-commit.ps1` (batched atomic commits) or explicit `commands/stage-commit.ps1` (Mode A surgical <= 150 LOC target; Mode B `-Scaffold` with manifest for >= 15 cohesive files).
- **AP-006 Context & Token Budget Exhaustion**: Pass targeted file ranges, diff metrics (`commands/measure-diff.ps1`), and paths to subagents rather than dumping entire monolithic files.
- **AP-007 Ghost Edits & State Isolation Violations**: Store all temporary session artifacts exclusively under `.agents/session-[SHA]/` (or `.agents/specs/session-[SHA]/`).
- **AP-008 Destructive Documentation Mutations**: Never delete, truncate, or overwrite human-authored sections in `GEMINI.md`. Append and synchronize incrementally.
- **AP-009 Unread Context Execution & Phase-Transition Caching**: At each phase transition, read `GEMINI.md`, the active track/phase `SKILL.md`, and ONLY the matched `resources/stack-rules/rules-*.md` once before invoking mutating/subagent tools.
- **AP-010 Main Agent Self-Review Fabrication**: The main orchestrating agent is strictly READ-ONLY on `.agents/**/code-review/review/*.md` and `.agents/**/audit/bin/*.md`. All review/audit verdicts MUST be authored by independent subagents (or external R-Agent).

---

## 3. Core Engineering Principles (`EP-01` through `EP-12`)

Full guidance & examples live in [`resources/engineering-principles.md`](resources/engineering-principles.md) (synthesizing all 24 `pstack` engineering principles without weakening OOP/JSX boundaries):

| ID | Principle | Core Operational Directive |
| :--- | :--- | :--- |
| **EP-01** | **Prove It Works** | Verify against the real running artifact (not "it compiles"); new assertions/checks must be seen failing on a seeded/inverted break before trusting green. |
| **EP-02** | **Fix Root Cause & Attack Premise** | Trace failures backward to the origin state; when >=2 fixes sharing one premise fail the same gate, stop, state the premise, and test it directly. |
| **EP-03** | **Subtract Before Adding** | Delete dead code, stale flags, and single-caller wrapper layers first to minimize reader load—while **strictly preserving 1 OOP type/file & <= 2 inline JSX children**. |
| **EP-04** | **Foundational Data Shapes** | Design immutable types, schemas, and state machines (`skills/statechart/SKILL.md` for concurrency/races) before writing control logic. |
| **EP-05** | **Boundary & Type Discipline** | Parse and validate external inputs at boundaries; share typed parser/serializer contracts across modules; keep core logic pure. |
| **EP-06** | **First-Principles Convergence** | Redesign around new requirements as if foundational from day one; migrate callers and delete legacy shims in one wave. |
| **EP-07** | **Exhaust Design & Build the Lever** | Compare 2+ concrete shapes (`skills/design-architect/SKILL.md`) or parallel candidates (`skills/solution-arena/SKILL.md`) on uncertain designs; automate repeatable work with scripts/tools. |
| **EP-08** | **Separate State & Idempotence** | Isolate parallel workers in separate worktrees/branches (`swarm`) before sharing; make scripts and lifecycle operations retry-safe. |
| **EP-09** | **Verifiable Units & UX First** | Sequence changes into small verifiable increments ending in live checks; prioritize user/developer delight over quick internal shortcuts. |
| **EP-10** | **Test Behavior, Not Internals** | Verify real cross-module user journeys (Producer UI -> API -> DB -> Consumer UI) rather than synthetic isolated mocks. |
| **EP-11** | **Explain Numbers & Guard Context** | Run `skills/benchmark-audit/SKILL.md` on every measured performance number; keep raw traces/bulky files out of main chat context. |
| **EP-12** | **Proceed & Harden Structure** | Act autonomously on reversible work (pause only for irreversible mutations); fix repeated mistakes structurally via `skills/repo-hardening/SKILL.md` (Architecture > Types > Lint > Test > Docs last). |

---

## 4. Lifecycle & Reviewer Consensus Standard

- **Track Selection (`S1`)**: Feature/migration work runs `S2 -> S3 -> S4 (unanimous LGTM) -> S6 -> S7 -> S8 -> S10 -> S11`. Empirical tracks (`bugfix`, `perf-hillclimb`, `prototype`, `investigation`, `refactor`, `autonomous`) follow `skills/s1-orchestrator/resources/tracks/*.md`.
- **Scope Jail**: Declare `target_files`, `infrastructure_files`, and `test_targets` in `task.md`; expand layout/shared infrastructure via `commands/escalate-scope.ps1`; verify at Gate 4 via `commands/verify-scope.ps1`.
- **Execution-Backed Consensus (`S8`)**: Unanimous `LGTM` required; 2-round circuit breaker prevents infinite loops (`skills/s8-code-review/resources/code-review-guide.md`). Any bug/regression verdict MUST carry live failing command/test reproduction (`skills/adversarial-review/SKILL.md`).

---

## 5. Git Commit Protocol (`S10` Conventional & Atomic)

- **Primary Flow**: Run `commands/auto-commit.ps1` (`scripts/auto-commit.mjs`) for automated cluster-aware atomic batching + AI/fallback messages, or `commands/stage-commit.ps1` for single surgical commits. Strictly NO `git push` or blind `git add .`.
- **Subject Line**: `<type>(<scope>): <imperative message>`, lowercase `<type>(<scope>):` prefix (`feat`, `fix`, `refactor`, `perf`, `test`, `build`, `ci`, `docs`, `chore`), target `<= 72` chars (`100` hard cap), preserve exact `PascalCase`/`camelCase` code identifiers (e.g. `UserRoleResolutionService`), no trailing period, blank line before body.
- **Commit Body**: Mandatory 1–2 concise sentences explaining technical mechanism & rationale, target `<= 150` chars (`180` hard cap; `300` for `-Scaffold` manifests), preserve exact code identifier casing. Prefix single cohesive files exceeding `150` LOC with `atomic: <reason>`.

---

## 6. Universal Developer Invariants (Senior Enterprise Standards)

### 6.1 Structural Code & Typing Invariants
1. **Strictly 1 Type Per File in OOP**: Every production class, interface, record, enum, or custom exception in object-oriented stacks (Java, C#, etc.) MUST reside in its own dedicated file matching its type name. Static nested classes, non-static inner classes, and inline helper records are strictly prohibited in production code (`src/main`).
2. **Zero Compiler Appeasement Pragmas**: Suppressing compiler/linter errors via `@SuppressWarnings`, `@ts-ignore`, `@ts-nocheck`, `any`, blanket `except Exception: pass`, or `#[allow(dead_code)]` is strictly FORBIDDEN.

### 6.2 Security, Identity & Secret Governance
3. **Two-Phase Escalation & Intermediate Token Quarantine**: Intermediate auth/2FA/reset tokens MUST be short-lived (`<= 5` minutes), single-use, and isolated from administrative endpoints.
4. **Single-Use JTI Invalidation**: Record unique `jti` identifiers revoked immediately on consumption via distributed cache (Redis) paired with an in-memory fallback.
5. **Client-Side Secret Exposure Prohibition**: Never expose tokens, DB URLs, or secrets via client bundler prefixes (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`).
6. **Hierarchical Privilege Gating**: Evaluate hierarchical ranks dynamically, failing closed when `targetRank >= operatorRank`; disallow admin self-deletion.

### 6.3 Frontend State, UI & Accessibility Invariants
7. **1:1 Route Mirroring & Component Decomposition Ceiling**: Route folders under `src/app/` MUST provide both `layout.tsx` and `page.tsx`; route UI and API clients mirror 1:1; every `.tsx` file defines `<= 1` primary component with <= 2 inline JSX children.
8. **Dirty State & Unsaved Changes Synchronization**: Form mutations track `isDirty` and dock persistent unsaved-change guards (`beforeunload` + warning bar).
9. **Atomic Token Refresh Mutex Queue**: Concurrent HTTP `401` responses serialize behind an atomic `isRefreshing` mutex lock with queued request replay.
10. **WCAG 2.2 AA Accessibility & Motion Safety**: Interactive controls maintain `>= 44x44px` touch targets on mobile, `3:1` `:focus-visible` contrast rings, and `prefers-reduced-motion: reduce` support.

### 6.4 Backend, Persistence & Network Invariants
11. **Concrete Type Deserialization on REST Clients**: Outbound HTTP clients deserialize into concrete typed DTOs—never untyped `JsonNode` or raw `Map<String, Object>`.
12. **Virtual Thread Concurrency Non-Pinning**: Avoid blocking I/O or `Thread.sleep` inside `synchronized` blocks on virtual thread runtimes; use `ReentrantLock` / non-blocking I/O.
13. **Migration-First Schema Authority (`ddl-auto: validate`)**: Relational schemas evolve solely via immutable numbered migration scripts.
14. **Document TTL Lifecycle & Redis Sliding-Window Limits**: Apply explicit TTL indexes/expirations on ephemeral cache/document keys and atomic sliding-window rate limiters.
15. **Mandatory Runtime Smoke & Real Journey Gate (`S7-B`)**: Unit mocks alone cannot pass `S7`; verify live context boot, real persistence cycles, and cross-module user journeys.
16. **Closed Vertical Slices**: Every mutating UI control connects end-to-end to real endpoints/persistence.
17. **State Lineage & Layout Boundary Infrastructure**: Updating shared shells/providers (`Header`, `Sidebar`, `layout.tsx`) required by a feature is authorized via `commands/escalate-scope.ps1` and exempt from scope-creep penalties.
18. **Temporal Lifecycle & Polling Immunity**: Verify recurring fetches (`setInterval`, SWR, React Query, WebSockets) with fake timers (`>= 2` intervals) while `isDirty = true` to prove in-flight input isn't clobbered.
19. **Production Polish & Anti-Slop Standards**: Reject raw diagnostics (`Node v\d+`, `x64`, `localhost:\d+`), debug UI buttons (`Dump State`), and decorative slop; require intentional theming depth (`node scripts/check-ui-slop.mjs`).

### 6.5 Layout Geometry, Touch Systems & Optional Domain Profiles
20. **Containing Block Safety & Portal Breakout**: Never mount viewport-fixed overlays/modals/tooltips inside ancestors with `transform`, `filter`, `perspective`, or `will-change`; render via Portals (`createPortal`) or native `<dialog>`.
21. **Mobile Touch & Pointer Parity**: Interactive drag surfaces declare `touch-action: pan-y` (or `none` for 2D), standardize on W3C Pointer Events with `setPointerCapture`, enforce a 10px drag threshold, and clamp coordinates to bounds.
22. **Unmocked Process Health Probes**: Background workers/daemons must survive `>= 3` seconds of unmocked live execution probes during `S7-B`.
23. **Hierarchical Fail-Closed Gating & Centralized Enums**: Gated features enforce HTTP `403` server-side + canonical route/permission guards client-side using centralized enum/constant identifiers.
24. **Geometric Aspect Ratio & Viewport Letterboxing**: Square avatars/badges enforce `aspect-ratio: 1 / 1` + `object-fit: cover`; constrained responsive viewports clamp with `max-width: 100vw` and `max-height: 100vh`.
25. **Optional Domain Profiles (`resources/stacks/`)**: Project-specific domain constraints (such as Discord bot slash-command interaction timeouts, plugin redirects, asset endpoints, and custom vector-canvas typography rules) live in opt-in domain packs like [`resources/stacks/discord-bot-customizer.md`](resources/stacks/discord-bot-customizer.md) and [`resources/stack-rules/rules-discord-bot-customizer.md`](resources/stack-rules/rules-discord-bot-customizer.md) rather than polluting unrelated codebases.
