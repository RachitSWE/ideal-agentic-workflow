# Session Execution Checklist

> **Anti-Drift Invariant**: Every step MUST be ticked off (`[x]`) upon completion. If a step is not ticked, it has not been completed. Do NOT proceed to downstream phases without ticking prior prerequisites.

- **Session SHA**: `[SHA]`
- **Mode**: `[standard | fast | trivial | duolithic]`
- **Skip List**: `[S2 | none]`

---

## Workflow Phases

### S1 · Context Ingestion [MANDATORY]
- [ ] Read `GEMINI.md` in full (FIRST action)
- [ ] Check for existing incomplete sessions in `.agents/`
- [ ] Generate 6-character session SHA
- [ ] Scaffold `.agents/session-[SHA]/` directory tree
- [ ] Record mode in `mode.txt`
- [ ] Compose technology stack into `context.md`
- [ ] S1 complete and confirmed

### S2 · Codebase Audit [SKIPPABLE]
- [ ] Status: `[EXECUTED | SKIPPED via skip list / fast mode]`
- [ ] Measure repository size (`file_count` and `loc_estimate`)
- [ ] Assign audit tier (Tier 1 / Tier 2 / Tier 3)
- [ ] Spawn auditor subagents with assigned personas
- [ ] Collect all `audit(n).md` files in `audit/bin/`
- [ ] Compile final `audit.md`
- [ ] S2 complete and confirmed

### S3 · Planning [MANDATORY]
- [ ] Read `audit.md` (if present) and `GEMINI.md` §5 (Open Features)
- [ ] Score and prioritize tasks using `priority-rubric.md`
- [ ] Write `.agents/session-[SHA]/plan.md`
- [ ] Write `.agents/session-[SHA]/task.md` with layer type tags (`[frontend]`, `[backend]`, etc.)
- [ ] Populate task rows below in Section: Task Execution Cycles

### S4 · Plan Review [SKIPPABLE]
- [ ] Status: `[EXECUTED | SKIPPED via skip list]`
- [ ] Generate `submit(0).md` for the plan
- [ ] Spawn plan reviewer subagents (or R-Agent onboarding if duolithic)
- [ ] Collect and evaluate all `review(n).md` files
- [ ] Handle feedback:
  - If `CHANGES_REQUESTED`: Revised `plan.md` and looped (S5)
  - If `LGTM` from all: S4 Approved

---

## Task Execution Cycles (S6 → S7 → S8)

<!-- Repeat this block for each task defined in task.md -->

### Task 1: [Task ID & Title] `[Type Tag]`
- [ ] **S6 · Coding**:
  - [ ] Selected lowest-indexed incomplete task, marked `[/]` in `task.md`
  - [ ] Loaded active stack packs from `resources/stacks/`
  - [ ] Implemented code for THIS TASK ONLY
  - [ ] Executed anti-pattern self-audit (AP-001 through AP-004 clean)
  - [ ] Task marked ready for testing
- [ ] **S7 · Automated Testing**:
  - [ ] Executed Tier 1 (Type check) — PASS
  - [ ] Executed Tier 2 (Linting / hygiene) — PASS
  - [ ] Executed Tier 3 (Automated tests) — PASS
- [ ] **S8 · Code Review**:
  - [ ] Generated `submit(N).md` with task-scoped diff
  - [ ] Selected reviewers from `task-reviewer-matrix.md` based on type tag
  - [ ] Spawned reviewers and received `review(n).md` files
  - [ ] Review Verdict:
    - [ ] `LGTM` from ALL reviewers achieved
    - [ ] If `CHANGES_REQUESTED`: Fixed in S9, re-ran S7, re-reviewed
  - [ ] Task marked `[x]` in `task.md`

---

## Finalization Phases

### S10 · Commit [MANDATORY]
- [ ] Gate check: All tasks in `task.md` are marked `[x]`
- [ ] Diff measurement: Ran `git diff --stat HEAD` (or `measure-diff.ps1`)
- [ ] Insertion check:
  - [ ] Insertions $\le 150$, OR
  - [ ] Insertions $> 150$ with mandatory atomic justification in commit body
- [ ] Staging: Staged files surgically using `git add <file>` (Zero `git add .`)
- [ ] Commit message: Conventional Commits format, 72-char subject, lowercase body
- [ ] Verified `git status` is clean

### S11 · Update GEMINI.md [MANDATORY]
- [ ] Gate check: Verified Git repository is clean
- [ ] Ran `git ls-files` to identify any new files
- [ ] Updated `GEMINI.md` sections surgically (non-destructive, append-only):
  - [ ] §2 / §3 (Architecture & Stack additions)
  - [ ] §4 (Directory Structure updated)
  - [ ] §5 (Completed features checked `[x]`)
  - [ ] §6 (Session History logged)
- [ ] Emitted 1–3 Global Skill Suggestions
- [ ] Emitted final loop closure: `"Start new conversation → S1"`
