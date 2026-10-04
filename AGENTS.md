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
- **Violation**: Inserting mock return values, dummy JSON payloads, simulated delays (`setTimeout`, `sleep`), or placeholder returns (`return true; // placeholder`) into production paths.
- **Rule**: Every production code path MUST be fully implemented, connecting to real database queries, APIs, and business rules. Mocks belong strictly inside test suites.

### AP-002: Conversational & Vibe Comments
- **Violation**: Polluting source files with conversational AI commentary such as `// Added as per task requirements`, `// Modified to fix null pointer`, or `// Antigravity agent implementation`.
- **Rule**: Code must be self-documenting. Comments are allowed ONLY to explain non-obvious domain rationale or mathematical algorithms ("why", never "what" or "who").

### AP-003: Unimplemented Stubs & Placeholders
- **Violation**: Leaving `TODO`, `FIXME`, `pass`, `throw new UnsupportedOperationException()`, or empty functions in committed code.
- **Rule**: If a feature is scheduled in `task.md`, it MUST be completely implemented. Unfinished code MUST NOT be marked `[x]` or committed.

### AP-004: Compiler & Linter Appeasement Hacks
- **Violation**: Silencing compiler or linter errors via escape hatches: TypeScript `any`, `@ts-ignore`, `@ts-nocheck`, ESLint disable comments, blanket Python `except Exception: pass`, or suppressing warnings.
- **Rule**: Fix the underlying architectural mismatch, type definition, or interface signature. Appeasement hacks are treated as critical defects.

### AP-005: Bulk Staging & Nuclear Commits
- **Violation**: Executing `git add .`, `git add -A`, or staging files blindly without inspecting the diff.
- **Rule**: Every modified file MUST be staged individually and explicitly (`git add path/to/file.ts`). Plugin hooks actively block `git add .`.

### AP-006: Context & Token Budget Exhaustion
- **Violation**: Dumping entire monolithic source files into subagent prompts or conversation transcripts, causing memory saturation and degraded model reasoning.
- **Rule**: Pass only relevant file ranges, structured diff summaries (`commands/measure-diff.ps1`), and targeted specifications (`submit(n).md`).

### AP-007: Ghost Edits & State Isolation Violations
- **Violation**: Writing temporary files, scratch scripts, or unmanaged test outputs to the workspace root or system temp directories.
- **Rule**: All session state, audit outputs, plans, reviews, and temporary markers MUST live exclusively inside `.agents/session-[SHA]/`.

### AP-008: Destructive Documentation Mutations
- **Violation**: Deleting, truncating, or refactoring human-authored sections in `GEMINI.md` or architecture documents.
- **Rule**: Agents may append new knowledge, update feature statuses, and record anti-patterns. Deleting or overwriting user documentation is strictly forbidden.

---

## 3. Workflow Lifecycle Invariants (S1–S11)

The workflow follows a strict, non-negotiable state machine:
`S1 (Context) -> S2 (Audit) -> S3 (Plan) -> S4 (Plan Review) -> S5 (Plan Fix) -> S6 (Code) -> S7 (Test) -> S8 (Code Review) -> S9 (Bug Fix) -> S10 (Commit) -> S11 (Sync)`

- **Pre-Code Gate**: NEVER write production code before `plan.md` exists and is signed off with `LGTM` by all S4 reviewers.
- **Pre-Review Gate**: NEVER invoke S8 Code Review if any automated test in S7 is failing.
- **Consensus Gate**: Zero self-review. Review files (`review(n).md`) MUST originate from independently spawned subagents or R-Agent. A single `CHANGES_REQUESTED` blocks advancement to S10.
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
