---
name: s9-bug-fix
description: Executes the code bug fix loop when S8 Code Review reports findings, surgically remediating defects, re-verifying via S7 Automated Testing, and securing unanimous LGTM consensus before proceeding to S10 Commit.
---

# S9 Bug Fix Loop

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S9 Bug Fix phase within the `ideal-agentic-workflow` plugin. 
The S9 phase functions as the uncompromising quality remediation gate when code submitted in S8 fails to achieve unanimous peer review approval.
In traditional AI development, models often dismiss review feedback, argue defensively, or attempt to sneak unverified code into Git commits.
The S9 phase enforces complete accountability: every finding must be directly addressed in code, verified green via the S7 automated test suite, and resubmitted to reviewers until 100% consensus is achieved.
No task may ever be marked `[x]` in `task.md` until this loop is cleanly completed.

## 2. Hard Gating and Invariants
- **Unanimous Consensus Gate**: One `CHANGES_REQUESTED` blocks progression. The agent MUST NOT proceed to S10 Commit or start the next task.
- **Mandatory Re-Testing Invariant**: The agent MUST NEVER resubmit code to S8 reviewers or claim fixes without re-running the full S7 Automated Testing suite.
- **Zero Anti-Patterns**: Bug fixes MUST NOT introduce new anti-patterns (no mock data, no verbose apology comments, no `any` / `@ts-ignore` compiler appeasement).
---

## 3. Mandatory Files to Read at this Step

Before modifying source files or resubmitting for review, the agent MUST explicitly read:
1. **Review Findings**:
   - `.agents/session-[SHA]/code-review/review/review(n).md` (All reviewer reports containing `CHANGES_REQUESTED` findings)
2. **Review Guidelines & Invariant Rules**:
   - `skills/s8-code-review/resources/code-review-guide.md` (Reviewer checklist, anti-patterns AP-001 through AP-008, and verdict rubric)
   - `rules/AGENTS.md` (Global senior developer invariants and strict anti-appeasement rules)
   - `resources/error-handling-guide.md` (Disciplined typed error patterns for defect remediation)
3. **Automated Testing Suite & Tools**:
   - `skills/s7-testing/SKILL.md` (Mandatory automated testing protocol before resubmitting)
   - `skills/s7-testing/resources/test-commands.md` (Domain-Driven Targeted Testing commands)
   - `commands/verify-stack.ps1` (Stack verification script)
4. **Resubmission Templates & Session State**:
   - `resources/submit-template.md` (Schema for authoring `.agents/session-[SHA]/code-review/submit/submit(N+1).md` with fix changelog)
   - `.agents/session-[SHA]/task.md` (Active task status and architectural type tags)

---

## 4. Bug Fix Execution Protocol

```text
┌────────────────────────────────────────────────────────┐
│ S8 Review Rejection: review(n).md has CHANGES_REQUESTED │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 1: Compile Finding Checklist                      │
│ - Ingest all review(n).md findings                     │
│ - Itemize line-level defects, security flaws, and lints│
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 2: Surgical Code Remediation                      │
│ - Implement fixes directly in source files             │
│ - Run mental anti-pattern self-audit (AP-001 - AP-004) │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 3: Mandatory S7 Automated Testing                 │
│ - Run Tier 1: Type Checking (tsc / mypy / cargo check) │
│ - Run Tier 2: Linting & Hygiene                        │
│ - Run Tier 3: Test Suites (vitest / pytest / gradlew)  │
│ - IF FAILS → Re-fix until 100% green exit code 0       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 4: Write submit(N+1).md with Fix Changelog        │
│ - Detail exact resolutions for each reviewer finding   │
│ - Attach test pass verification evidence               │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
               RE-INVOKE S8 CODE REVIEW
                           │
        ┌──────────────────┴──────────────────┐
        ▼                                     ▼
CHANGES_REQUESTED                         ALL LGTM
  (Loop back S9)                  (Mark task [x] in task.md)
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                      More tasks remain?            All tasks complete?
                      → Loop back to S6             → Proceed to S10
```

### 4.1 Step 1: Ingest and Itemize Reviewer Findings
The agent MUST read every `review(n).md` in `.agents/session-[SHA]/code-review/review/`.
Compile a clear action checklist:
- **Defects**: Logical bugs, race conditions, edge case crashes.
- **Security**: Insecure parameters, injection hazards, missing auth checks.
- **Architecture**: Inappropriate imports, violating layer boundaries from loaded stack pack.
- **Anti-patterns**: Any detection of AP-001 through AP-004.

### 4.2 Step 2: Implement Code Fixes
Modify the affected files surgically using code replacement tools.
Do NOT touch unrelated files.
Verify that all newly written logic conforms to the stack pack in `resources/stacks/`.

### 4.3 Step 3: Mandatory S7 Automated Testing
Invoke the S7 Automated Testing skill (`skills/s7-testing/SKILL.md`):
1. Execute the stack's type checking command.
2. Execute the linter command.
3. Execute the unit/integration test suite.
**Critical Rule**: If any test fails, do not return to reviewers. Fix the code and re-test until exit code is 0.

### 4.4 Step 4: Prepare Resubmission Changelog
Write an incremented submission file (e.g., `submit(1).md`) to `.agents/session-[SHA]/code-review/submit/` containing:
- **Changelog of Fixes**: Exact mapping of reviewer critiques to code diff changes.
- **Verification Evidence**: Terminal output proving tests pass with 0 errors.

### 4.5 Step 5: Peer Review Re-Evaluation
Send a message to the reviewers or re-invoke S8 Code Review with `submit(N+1).md`.
- If any reviewer still emits `CHANGES_REQUESTED`, repeat S9.
- If ALL reviewers emit `LGTM`:
  1. Mark the active task as `[x]` in `.agents/session-[SHA]/task.md`.
  2. Tick the task review complete in `.agents/session-[SHA]/CHECKLIST.md`.
  3. Inspect `task.md` for remaining incomplete tasks:
     - If incomplete tasks remain: Loop back to S6 Coding to pick the next lowest-indexed task.
     - If all tasks are `[x]`: Proceed to S10 Git Commit.
