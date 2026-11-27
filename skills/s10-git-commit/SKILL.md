---
name: s10-git-commit
description: "Use only after S7 tests and S8 review pass to stage and commit atomic Conventional Commits cleanly via commands/auto-commit.ps1 or commands/stage-commit.ps1 without git push or git add ."
---

# S10 Git Commit

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S10 Git Commit phase within the `ideal-agentic-workflow` plugin. 
The S10 phase is the critical finalization step where peer-reviewed, tested code is permanently recorded into the project's version control history.
The orchestrating agent MUST execute the protocols defined below to guarantee that the repository history remains pristine, traceable, and automation-friendly.
Generating chaotic, massive, or poorly formatted commits completely undermines the discipline enforced during the previous nine phases of the workflow.
This rigorous approach ensures that every change is easily auditable and properly scoped into logical, atomic units.
The orchestrating agent MUST strictly manage the commit sizing, enforce exact formatting rules, and verify task completion before staging.
Failure to properly execute this phase will break semantic versioning tools and severely degrade the maintainability of the project.
The S10 phase explicitly transitions the workflow from active development into documentation synchronization.

---

## 2. Mandatory Files to Read at this Step

### Phase Step 0: Mandatory `view_file` Execution Gate
Before staging any files, running diff measures, or executing `git commit`, the orchestrating agent MUST explicitly call `view_file` on EVERY file listed below. Committing without verifying commit guidelines and diff thresholds violates **AP-009 (Unread Context Execution)**.

1. **Commit Formatting & Sizing Guidelines**:
   - `skills/s10-git-commit/resources/commit-examples.md` (Conventional Commit type taxonomy, subjects, and scopes)
   - `skills/s10-git-commit/resources/breaking-change-guide.md` (Formatting breaking API footers and migrations)
   - `skills/s10-git-commit/resources/commit-split-guide.md` (Rules for decomposing commits exceeding 150 insertions)
2. **Commit Automation Commands**:
   - `commands/auto-commit.ps1` & `scripts/auto-commit.mjs` (Primary automated S10 pipeline: clusters pending diffs by domain/directory up to 150 LOC, uses `GEMINI_API_KEY` or offline deterministic fallback, preserves exact identifier casing)
   - `commands/measure-diff.ps1` (Measures insertions and validates atomic threshold)
   - `commands/stage-commit.ps1` (Manual surgical per-file staging and validation for single-unit commits)
3. **Session Verification State**:
   - `.agents/session-[SHA]/task.md` (Enforce invariant: 100% of tasks must be marked `[x]`)
   - `.agents/session-[SHA]/CHECKLIST.md` (Track S10 completion)

---

## 3. Hard Gating and Modal Sizing Rules
The integrity of the commit history relies entirely on the agent verifying that all assigned work is actually finished before modifying the git tree. 
The agent MUST explicitly verify the following absolute gating rule before running any `git commit` commands.
The agent MUST acknowledge the absolute prohibition: "No commit before all tasks [x] in task.md."
If any task in the `.agents/session-[SHA]/task.md` file remains incomplete or marked as in-progress (`[/]`), the agent MUST immediately loop back to S6 Coding.
Once the progression gate is cleared, the agent MUST measure diff insertions using `git diff --stat HEAD` or `commands/measure-diff.ps1`.
For Standard and Duolithic Modes, the agent MUST adhere to the sizing rule: "~50-150 insertions per commit (guideline)."
The agent MUST "never split atomic units". If a commit exceeds 150 insertions, the agent MUST read `skills/s10-git-commit/resources/commit-split-guide.md`.
If the change is truly atomic, the commit body MUST contain "one sentence explaining why this is one atomic unit". If not, the agent MUST follow `skills/s10-git-commit/resources/commit-split-guide.md` to stage per-file into split commits.
For Fast Mode, the agent MUST apply the override: "No size target — commit what the fix requires."
For the Trivial Protocol, the agent MUST apply the override: "Single commit with type `docs` or `chore`."

### 3.1 Dual-Mode Staging Standard & Primary Auto-Commit Pipeline (AP-005)
Under NO circumstances may the agent execute blind bulk staging (`git add .` or `git add -A`) or `git push`. Staging MUST follow one of these standardized AP-005 flows:
1. **Primary Automated Flow (`commands/auto-commit.ps1`)**:
   - After 100% of `task.md` items pass S7/S8 (`[x]`), run `powershell -File commands/auto-commit.ps1 -DryRun` to preview clustered batches (`<= 150` LOC per batch, single `> 150` LOC files flagged `atomic:`), then run `powershell -File commands/auto-commit.ps1` (`scripts/auto-commit.mjs`).
2. **Mode A: Manual Surgical Mode (`commands/stage-commit.ps1`)**:
   - Used for single manual atomic increments: `powershell -File commands/stage-commit.ps1 -Files @("path/to/file.ts") ...` (`~50–150` insertions).
3. **Mode B: Scaffold / Refactor Mode**:
   - Permitted when generating $\ge 15$ new cohesive files or performing large initial architectural scaffolding (`-Scaffold` switch with structured manifest body up to 300 chars).

### 3.2 Commit Formatting Protocol
Before finalizing the git commit message, read `skills/s10-git-commit/resources/commit-examples.md` and `skills/s10-git-commit/resources/breaking-change-guide.md`:
- **Subject Line**: Conventional Commit `<type>(<scope>): <imperative message>` — lowercase `<type>(<scope>):` prefix, target `<= 72` chars (`100` hard cap), preserve exact `PascalCase`/`camelCase` code identifiers (e.g., `RoleVerifyExecutor`), no trailing period, blank line before body.
- **Commit Body**: Always required (`<= 150` target / `<= 180` hard cap for Mode A; `300` for `-Scaffold`), explaining technical mechanism & rationale while preserving exact identifier casing (prefix single files `> 150` LOC with `atomic: <reason>`).
- **Breaking Changes**: Append `BREAKING CHANGE:` footer per `skills/s10-git-commit/resources/breaking-change-guide.md`.
