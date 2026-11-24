# Agent Behavioral Rules & Invariant Charter

This document defines the absolute, non-negotiable behavioral constraints for any AI agent operating within the `ideal-agentic-workflow` plugin. 

These rules MUST be loaded on every session. 

They exist to eliminate "Vibe Coding" and enforce disciplined, deterministic Senior Agentic Engineering. 

Agents MUST NOT treat these rules as suggestions; they are absolute invariants. 
Any violation breaks the fundamental integrity of the workflow and voids session verification.

---

## 1. Core Operating Philosophy: Zero Vibe Coding

1. **Deterministic Over Exploratory**: Every action must stem from a verified plan (`plan.md`), mapped to a discrete task (`task.md`), backed by automated test evidence, and signed off by peer subagents.
2. **Evidence Before Assertions**: An agent MUST NEVER claim a bug is resolved, a feature is implemented, or a test passes without running the actual execution command and inspecting the output.
3. **No Autonomous Scope Creep**: Implement ONLY what is specified in the task list. Do not refactor adjacent files or "tidy up" unrelated code unless explicitly scheduled.

---

## 2. The 8 Anti-Patterns of Agentic Coding (AP-001 through AP-008)

Auditors (S2) and Reviewers (S4, S8) MUST actively detect and reject any code or session artifact displaying these anti-patterns:

### AP-001: Simulation & Mock Code in Production
- **Violation**: Inserting mock return values, dummy JSON payloads, simulated delays (`setTimeout`, `sleep`), placeholder returns (`return true; // placeholder`), or disguising in-memory stub mutations under "Local Demo" / "Preview" badges in production views.
- **Rule**: Every production code path MUST be fully implemented, connecting to real database queries, APIs, and business rules. Mocks belong strictly inside test suites. "Local Demo" escape hatches in production paths are strictly forbidden.

### AP-002: Conversational & Vibe Comments
- **Violation**: Polluting source files with conversational AI commentary such as `// Added as per task requirements`, `// Modified to fix null pointer`, or `// Antigravity agent implementation`.
- **Rule**: Code must be self-documenting. Comments are allowed ONLY to explain non-obvious domain rationale or mathematical algorithms ("why", never "what" or "who").

### AP-003: Unimplemented Stubs & Placeholders
- **Violation**: Leaving `TODO`, `FIXME`, `pass`, `throw new UnsupportedOperationException()`, or empty functions in committed code.
- **Rule**: If a feature is scheduled in `task.md`, it MUST be completely implemented. Unfinished code MUST NOT be marked `[x]` or committed.

### AP-004: Compiler & Linter Appeasement Hacks
- **Violation**: Silencing compiler or linter errors via escape hatches: TypeScript `any`, `@ts-ignore`, `@ts-nocheck`, ESLint disable comments, blanket Python `except Exception: pass`, or suppressing warnings.
- **Rule**: Fix the underlying architectural mismatch, type definition, or interface signature. Appeasement hacks are treated as critical defects.

### AP-005: Bulk Staging & Scope-Aware Atomic Staging
- **Violation**: Executing blind bulk staging (`git add .`, `git add -A`, `git add --all`) without targeted file or directory scope, or committing unstructured mega-diffs without inspecting changes.
- **Rule**: Staging MUST adhere to one of two scope-aware staging modes:
  - **Mode A: Surgical Mode** (default for bug fixes, atomic increments, and refactors): Every modified file MUST be staged individually and explicitly (`git add path/to/file.ts`). Target size is ~50–150 LOC per commit.
  - **Mode B: Scaffold / Refactor Mode** (permitted when creating $\ge 15$ new cohesive files or initial feature scaffolding): Directory-scoped staging (`git add src/components/common/` or `commands/stage-commit.ps1` -Scaffold) is permitted, provided the commit body contains a structured manifest itemizing the scaffolded components. Blind `git add .` remains strictly blocked.

### AP-006: Context & Token Budget Exhaustion
- **Violation**: Dumping entire monolithic source files into subagent prompts or conversation transcripts, causing memory saturation and degraded model reasoning.
- **Rule**: Pass only relevant file ranges, structured diff summaries (`commands/measure-diff.ps1`), and targeted specifications (`submit(n).md`).

### AP-007: Ghost Edits & State Isolation Violations
- **Violation**: Writing temporary files, scratch scripts, or unmanaged test outputs to the workspace root or system temp directories.
- **Rule**: All session state, audit outputs, plans, reviews, and temporary markers MUST live exclusively inside `.agents/session-[SHA]/`.

### AP-008: Destructive Documentation Mutations
- **Violation**: Deleting, truncating, or refactoring human-authored sections in `GEMINI.md` or architecture documents.
- **Rule**: Agents may append new knowledge, update feature statuses, and record anti-patterns. Deleting or overwriting user documentation is strictly forbidden.

### AP-009: Unread Context Execution & Phase-Transition Caching
- **Violation**: Taking action tools (`run_command`, `write_to_file`, `replace_file_content`, `invoke_subagent`) upon entering a new phase without FIRST calling `view_file` on all designated mandatory phase files for that phase transition.
- **Rule**: Every phase transition MUST begin with Phase Step 0: explicitly invoking `view_file` ONCE per phase transition on every mandatory file listed for that phase. Agents maintain active phase context in working memory throughout the phase, eliminating turn-by-turn re-reading to prevent token exhaustion and context compactions. Assuming knowledge or skipping `view_file` at a phase transition constitutes a verification failure.

### AP-010: Main Agent Self-Review Fabrication
- **Violation**: The main orchestrating agent invoking `write_to_file` or `replace_file_content` on ANY file matching:
  - `.agents/session-[SHA]/code-review/review/review*.md`
  - `.agents/specs/session-[SHA]/code-review/review/review*.md`
  - `.agents/session-[SHA]/audit/bin/audit*.md`
- **Rule**: The main orchestrating agent is strictly **READ-ONLY** (`view_file`) for all review and audit slice directories. Review files MUST be authored exclusively by independent subagents spawned via `invoke_subagent` (or external R-Agent). If the main agent authors a review file itself, the session is invalidated immediately.

---

## 3. Workflow Lifecycle Invariants (S1–S11)

The workflow follows a strict, non-negotiable state machine:
`S1 (Context) -> S2 (Audit) -> S3 (Plan) -> S4 (Plan Review) -> S5 (Plan Fix) -> S6 (Code) -> S7 (Test) -> S8 (Code Review) -> S9 (Bug Fix) -> S10 (Commit) -> S11 (Sync)`

- **Phase Step 0 Read Gate**: At each phase transition (entering S1, S2, etc.), the agent MUST call `view_file` once on all designated mandatory files before calling any commands, writing code, or spawning subagents. Active context is cached in memory throughout that phase.
- **Pre-Code Gate**: NEVER write production code before `plan.md` exists and is signed off with `LGTM` by all S4 reviewers.
- **Pre-Review Gate**: NEVER invoke S8 Code Review if any automated test in S7 is failing.
- **Consensus Gate**: Zero self-review (AP-010). The main agent is strictly prohibited from writing `review(n).md`. Review files MUST originate from independently spawned subagents or R-Agent. A single `CHANGES_REQUESTED` blocks advancement to S10.
- **Commit Gate**: NEVER proceed to S10 Git Commit if any task in `task.md` remains unchecked `[ ]`.
- **First Action Invariant**: ALWAYS read `GEMINI.md` in full before reading or modifying any source file.
- **Initialization Invariant**: ALWAYS initialize `.agents/session-[SHA]/` before starting S2 or S3.

---

## 4. File System & Memory Isolation

- **Session Quarantine**: All agent-generated state is isolated to `.agents/session-[SHA]/`:
  ```
  .agents/session-[SHA]/
  ├── audit/bin/           # S2 Auditor outputs
  ├── code-review/submit/  # S4/S8 Submission payloads
  ├── code-review/review/  # S4/S8 Review reports
  ├── plan.md              # S3 Master implementation plan
  ├── task.md              # S3 Prioritized task checklist
  ├── context.md           # S1 Ingested context & stack packs
  ├── mode.txt             # S1 Operating mode
  └── CHECKLIST.md         # S1-S11 Master execution checklist
  ```
- **External Boundaries**: Never touch files outside the project root directory. System configuration modifications are strictly prohibited.
- **Knowledge Base Sync**: At S11, autonomous additions to `anti-patterns.md` and `GEMINI.md` are the only permitted post-implementation writes.

---

## 5. Git Commit Protocol (Conventional & Atomic)

Every commit generated during S10 Git Commit MUST adhere to the following schema:
- **Format**: Conventional Commits standard: `<type>(<scope>): <subject>`
  - Permitted types: `feat`, `fix`, `refactor`, `perf`, `test`, `build`, `ci`, `docs`, `chore`
- **Subject Line**:
  - Maximum 72 characters.
  - Imperative mood ("add feature", not "added" or "adds").
  - All lowercase, no trailing period.
  - Mandatory blank line between subject and body.
- **Commit Body**:
  - Mandatory for every commit.
  - All lowercase, maximum 150 characters.
  - Explains the rationale and impact of the change.
- **Atomic Insertion Sizing**:
  - Target ~50–150 insertions per commit.
  - If insertions exceed 150 lines: the body MUST include a clear explanation of why this change represents an indivisible atomic unit.
  - Never break working code or split tests away from their implementation just to meet sizing targets.

---

## 6. Reviewer Consensus Standard

- Unanimous `LGTM` from all assigned reviewers is required.
- If ANY reviewer emits `CHANGES_REQUESTED`:
  - Transition immediately to S5 (for plan changes) or S9 (for code changes).
  - Remediate the exact issues cited in the review.
  - Re-run verification and resubmit for peer review.
- Reviewers MUST be matched to the detected project stack using `skills/s8-code-review/resources/task-reviewer-matrix.md`.

---

## 7. Universal Developer Invariants (Senior Enterprise Standards)

All agents, auditors (S2), and reviewers (S4, S8) MUST enforce these universal architectural invariants across all codebases:

### 7.1 Structural Code & Typing Invariants
1. **Strictly 1 Type Per File in OOP**: Every production class, interface, record, or enum in object-oriented stacks (Java, C#, etc.) MUST reside in its own dedicated source file matching the type name. Static nested classes, non-static inner classes, and inline helper records are prohibited in production packages (`src/main`).
2. **Zero Compiler Appeasement Pragmas**: Suppressing compiler or linter diagnostics via escape hatches (`@SuppressWarnings`, `@ts-ignore`, `@ts-nocheck`, `any`, blanket `except Exception: pass`, `#[allow(dead_code)]`) is strictly FORBIDDEN. All production code must compile warning-free with strict typing.

### 7.2 Security, Identity & Secret Governance
3. **Two-Phase Escalation & Intermediate Token Quarantine**: High-privilege access tokens must never be issued on unverified credentials. Intermediate authentication tokens (2FA handoffs, password reset tokens) MUST be short-lived ($\le 5$ minutes), single-use, and strictly quarantined from administrative APIs.
4. **Single-Use JTI Invalidation**: Single-use intermediate tokens MUST record unique cryptographic JWT IDs (`jti`) revoked immediately upon consumption, utilizing distributed caching (Redis) paired with an in-memory fallback during cache downtime.
5. **Client-Side Secret Exposure Prohibition**: Never prefix private credentials, bot tokens, OAuth client secrets, or database URLs with public bundler prefixes (`NEXT_PUBLIC_`, `VITE_`, `REACT_APP_`). Client bundles must receive only public endpoints and non-sensitive flags.
6. **Hierarchical Privilege Gating**: Administrative actions must evaluate hierarchical rank dynamically, failing closed if target rank $\ge$ operator rank. Administrator self-deletion is globally prohibited.

### 7.3 Frontend State, UI & Accessibility Invariants
7. **1:1 Route Mirroring & Component Decomposition Ceiling**: Route folders under `src/app/` must provide both `layout.tsx` (RSC metadata shell) and `page.tsx` (view). Route-specific UI components and API clients must mirror the route path 1:1. Every `.tsx` file MUST define $\le 1$ primary component with $\le 2$ inline JSX child elements.
8. **Dirty State & Unsaved Changes Synchronization**: Form mutations and configuration edits MUST synchronize with an `isDirty` state tracker, docking a persistent `UnsavedChangesBar` with `beforeunload` protection against accidental navigation loss.
9. **Atomic Token Refresh Mutex Queue**: When API requests encounter 401 Unauthorized, client interceptors MUST execute an atomic `isRefreshing` mutex lock with a queued request replay mechanism, preventing token rotation race conditions from concurrent calls.
10. **WCAG 2.2 AA Accessibility & Motion Safety**: Interactive buttons and controls MUST maintain a minimum 44px $\times$ 44px touch target on mobile viewports and provide high-contrast `:focus-visible` outline rings ($3:1$ contrast ratio). Animations must respect `prefers-reduced-motion: reduce`.

### 7.4 Backend, Persistence & Network Invariants
11. **Concrete Type Deserialization on REST Clients**: Outbound HTTP clients must deserialize responses into concrete, strongly typed DTOs. Deserializing into abstract classes or ASTs (e.g. Jackson `JsonNode`, raw `Map<String, Object>`) is prohibited.
12. **Virtual Thread Concurrency Non-Pinning**: In virtual thread runtimes, carrier threads must not be pinned or blocked by `synchronized` blocks or `Thread.sleep`; use `ReentrantLock` and non-blocking asynchronous I/O.
13. **Migration-First Schema Authority (`ddl-auto: validate`)**: Production relational schemas must be governed exclusively by immutable, numbered migration scripts. ORM automatic schema mutation in production is strictly forbidden.
14. **Document TTL Lifecycle & Redis Sliding-Window Rate Limiting**: Ephemeral document collections must declare automated TTL indexes. Redis keys must follow hierarchical namespacing with mandatory TTL expirations, and high-throughput throttlers must use atomic Lua sliding-window sorted sets.
15. **Mandatory Runtime Bootstrap & Smoke Gate (S7-B Gate)**: Unit tests with mocks alone cannot certify release readiness. Changes modifying beans, entities, routes, or UI components must pass automated runtime smoke tests (e.g. `@SpringBootTest`, Playwright browser tests, Testcontainers persistence cycles) before peer review sign-off.
16. **Closed Vertical Slices & Local Demo Prohibition**: Every UI control that mutates state MUST connect to a concrete network client, API endpoint, or database operation. Disguising simulated in-memory state under "Local Demo" or "Preview" badges in production views violates AP-001 and is strictly prohibited.
17. **State Lineage & Layout Boundary Infrastructure**: Scope isolation is defined by state lineage, not isolated leaf files. When a feature produces or consumes state displayed in shared layout shells (Header, Sidebar, Navigation, Status Bar), updating the shared context provider or layout shell is mandatory state infrastructure and is explicitly excluded from scope-creep restrictions.
18. **Temporal Lifecycle & Polling Mutation Immunity**: Components with recurring asynchronous fetches (polling, SWR, React Query, WebSockets) MUST be tested with simulated timers across $\ge 2$ intervals while `isDirty = true` to prove in-flight user input is never clobbered by incoming background payloads. Unmount interval cleanup must be verified.
19. **Objective Production Polish & Anti-Slop Standards**: Reviewers must reject raw technical diagnostic strings (`x64`, `Node v\d+`, `localhost:\d+`, unhandled errors) in user-facing layouts, reject cartoonish novelty geometry (zigzag SVGs, spiky decorative clip-paths) not in the design system, and require 3-layer theming depth (Surface Base, Text Contrast, and Atmospheric Backdrop).

### 7.5 Layout Geometry, Touch Systems & Visual Compositors
20. **Containing Block Safety & Portal Breakout**: Viewport-fixed overlays, full-screen modals, tooltip anchors, and lens magnifiers MUST NOT be mounted inside ancestor containers styling `transform`, `filter`, `perspective`, or `will-change`. Overlays MUST be rendered via React Portals (`createPortal(..., document.body)`) or native `<dialog>`, breaking out of transformed coordinate hierarchies to avoid viewport offset clipping and event entrapment.
21. **Mobile Touch & Pointer Parity**: Interactive drag surfaces, custom sliders, and vector canvas controls MUST declare CSS `touch-action: pan-y` (or `touch-action: none` for 2D canvases) to permit vertical page scrolling without event hijacking. Gesture listeners MUST standardize on W3C Pointer Events (`onPointerDown`, `onPointerMove`, `onPointerUp`) with `setPointerCapture`, enforce a minimum 10px drag threshold before committing drag state, and clamp calculated coordinates strictly to container bounding boxes.
22. **Unmocked Process Health & Central Registry Canonicalization**: Background worker processes, native binaries, and bot daemons MUST be verified via unmocked process health probes running $\ge 3$ seconds of uninterrupted live execution before claiming operational readiness (S7-B). Bot integrations (e.g. Discord, Slack) MUST resolve assets and emojis exclusively through the centralized application client registry rather than relying on unvalidated local string templates or guild-scoped mutations.
23. **Hierarchical Feature Gating & Route Canonicalization**: System features gated by administrative configuration or licensing MUST enforce defense-in-depth across both network and routing tiers. API endpoints of disabled modules MUST reject requests with HTTP 403 Forbidden; client-side route guards MUST intercept disabled views and redirect immediately to the catalog overview (`/plugins`). Feature and plugin identifiers MUST reference centralized canonical constant enums to eliminate string drift.
24. **Geometric Aspect Ratio & Viewport Letterboxing**: User avatars, profile badges, and square thumbnail containers MUST enforce strict 1:1 geometry using CSS `aspect-ratio: 1 / 1` and `object-fit: cover` to eliminate horizontal and vertical oval distortion. Responsive modal viewports and aspect-constrained canvases MUST implement strict 16:9 letterboxing (`aspect-ratio: 16 / 9`, `object-fit: contain`, `max-width: 100vw`, `max-height: 100vh`) with viewport-clamped dimensions.
25. **Single-Source Opentype Compositor & Buffer Entropy Gate**: Headless image rendering pipelines (Node.js/Sharp/Canvas) MUST resolve assets via canonical data directory paths (`DATA_DIR`), render typographical glyphs as mathematical vector paths via `opentype.js` Bezier curves, and synchronize coordinate bounding boxes with web canvas representations within $\le 2$px. Rendered image buffers MUST pass mechanical entropy gates asserting byte budget $> 50$KB and luminance standard deviation $> 15.0$ to catch black-void or blank-render regressions.

