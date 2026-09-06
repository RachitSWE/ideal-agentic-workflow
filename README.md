This is the starting prompt to give to the agent to invoke this workflow:
```
╔═══════════════════════════════════════════════════╗
║           INVOKE: ideal-agentic-workflow PLUGIN   ║
║           Version 1.1.0 · Author: RachitSWE       ║
╚═══════════════════════════════════════════════════╝

═══════════════════════════════════════════════════
 MODE  (pick exactly one — delete the others)
═══════════════════════════════════════════════════

  [ ] Standard   — Full S1–S11 workflow. Default.
  [ ] /fast mode — Single-task, reduced audit/review.
  [ ] /trivial   — Docs/non-source changes only.

═══════════════════════════════════════════════════
 TASK DESCRIPTION
═══════════════════════════════════════════════════

<----->

═══════════════════════════════════════════════════
 SKIP LIST  (only these 3 steps are user-skippable)
═══════════════════════════════════════════════════

  Steps that CAN be skipped (cross out those you want skipped):

  ☐ S2 — Codebase Audit    → skip only if audit.md < 7 days old
  ☐ S4 — Plan Review       → skip to go directly from plan to code
  ☐ S8 — Code Review       → skip only if mode is /trivial

  Fill in: Things to skip this session: <here>
  ⛔ S1, S3, S5, S6, S7, S9, S10, S11 are NEVER skippable.

═══════════════════════════════════════════════════
 EXECUTION DIAGRAM  (agent must follow this exact order)
═══════════════════════════════════════════════════

  ┌─────────────────────────────────────────────────────────────┐
  │ S1 · Context Ingestion                          [MANDATORY] │
  │                                                             │
  │  STEP 1 · Read GEMINI.md in full (FIRST action, always)    │
  │  STEP 2 · Scan .agents/ for incomplete sessions            │
  │           → If found: ask "Resume [SHA] or start fresh?"   │
  │  STEP 3 · Generate 6-char session SHA from timestamp       │
  │           → Read: skills/s1-orchestrator/resources/        │
  │                   session-init.md                          │
  │  STEP 4 · Run init-session script / create directories:    │
  │           .agents/session-[SHA]/                           │
  │           ├── audit/bin/                                   │
  │           ├── code-review/submit/                          │
  │           ├── code-review/review/                          │
  │           ├── plan.md (stub)                               │
  │           ├── task.md (stub)                               │
  │           ├── context.md                                   │
  │           ├── mode.txt                                     │
  │           └── CHECKLIST.md  ← tick every step off here    │
  │  STEP 5 · Detect operating mode → write to mode.txt        │
  │           → Read corresponding mode resource:              │
  │             resources/fast-mode.md | trivial-mode.md |     │
  │             duolithic-mode.md                              │
  │  STEP 6 · Detect technology stack from GEMINI.md §2.3     │
  │           → Read: resources/stacks/_stack-composer.md      │
  │           → Assemble pack list → write to context.md       │
  │  STEP 7 · Confirm S1 complete. Report to user.             │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S2 · Codebase Audit                [SKIPPABLE — see above] │
  │                                                             │
  │  STEP 1 · Read: skills/s2-codebase-audit/SKILL.md          │
  │  STEP 2 · Read: skills/s2-codebase-audit/resources/        │
  │                 fullstack-persona-bank.md  (or minecraft)  │
  │  STEP 3 · Measure repo size (file count + LOC estimate)     │
  │           → Select auditor tier (2 / 3–4 / 5 subagents)    │
  │  STEP 4 · Spawn auditor subagents with persona files from:  │
  │           agents/fullstack/  or  agents/minecraft/         │
  │  STEP 5 · Each auditor writes audit(n).md to               │
  │           .agents/session-[SHA]/audit/bin/                 │
  │  STEP 6 · Compiler subagent merges → audit.md              │
  │           → Read: resources/audit-template.md              │
  │  STEP 7 · Confirm S2 complete. Tick CHECKLIST.md.          │
  │                                                             │
  │  ⏭ SKIP condition: session skip list contains "S2"          │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S3 · Planning                                   [MANDATORY] │
  │                                                             │
  │  STEP 1 · Read: skills/s3-planning/SKILL.md                │
  │  STEP 2 · Read audit.md (if exists) + GEMINI.md §5         │
  │           (Open Features) + user task description           │
  │  STEP 3 · Read: skills/s3-planning/resources/              │
  │                 priority-rubric.md                         │
  │  STEP 4 · Score tasks using severity × complexity × deps   │
  │  STEP 5 · Write plan.md → .agents/session-[SHA]/plan.md    │
  │           → Read: resources/plan-template.md               │
  │  STEP 6 · Write task.md → .agents/session-[SHA]/task.md    │
  │           → Each task MUST have a type tag:                │
  │             [frontend] [backend] [database] [infra]        │
  │             [fullstack]                                    │
  │           → Read: resources/task-template.md               │
  │  STEP 7 · Expand CHECKLIST.md rows for each task.          │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S4 · Plan Review                   [SKIPPABLE — see above] │
  │                                                             │
  │  STEP 1 · Read: skills/s4-plan-review/SKILL.md             │
  │  STEP 2 · Read: skills/s4-plan-review/resources/           │
  │                 plan-review-guide.md                       │
  │  STEP 3 · Write submit(n).md for the plan:                 │
  │           .agents/session-[SHA]/code-review/submit/         │
  │           → Read: resources/submit-template.md             │
  │  STEP 4 · Spawn plan-reviewer subagents                     │
  │           (2 Standard · 3 Duolithic · 0 Fast/Trivial)      │
  │           → Personas: agents/fullstack/plan-critic.md      │
  │  STEP 5 · Read review(n).md from subagents                 │
  │  STEP 6 · If CHANGES_REQUESTED → revise plan.md → loop    │
  │           If LGTM from ALL → proceed to S6                 │
  │                                                             │
  │  ⏭ SKIP condition: session skip list contains "S4"          │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S6 · Code ONE Task                              [MANDATORY] │
  │                                                             │
  │  STEP 1 · Read: skills/s6-coding/SKILL.md                  │
  │  STEP 2 · Read: skills/s6-coding/resources/                │
  │                 stack-detector.md                          │
  │           → Load ALL applicable stack packs from           │
  │             resources/stacks/ for this project             │
  │  STEP 3 · Read: skills/s6-coding/resources/                │
  │                 anti-patterns.md                           │
  │  STEP 4 · Pick the LOWEST-INDEXED incomplete task          │
  │           from task.md. Mark it [/].                       │
  │  STEP 5 · Write production code for THIS TASK ONLY.        │
  │  STEP 6 · Anti-pattern self-audit: check AP-001 to AP-004  │
  │  STEP 7 · Mark task [x].                                   │
  │           ════════════════════════════════════             │
  │           [HARD STOP] — Do NOT move to next task.          │
  │           Do NOT write any more code. Go to S7.            │
  │           ════════════════════════════════════             │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S7 · Automated Testing                          [MANDATORY] │
  │                                                             │
  │  STEP 1 · Read: skills/s7-testing/SKILL.md                 │
  │  STEP 2 · Read: skills/s7-testing/resources/               │
  │                 test-commands.md                           │
  │  STEP 3 · Run test suite for detected stack                 │
  │  STEP 4 · If ANY test/lint/type-check FAILS:               │
  │           → Loop BACK to S6. Fix the failure.              │
  │           → Re-run S7. Never skip this check.              │
  │  STEP 5 · If ALL pass: proceed to S8.                      │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S8 · Code Review — ONE task                [SKIPPABLE*]    │
  │      * only in /trivial mode                               │
  │                                                             │
  │  STEP 1 · Read: skills/s8-code-review/SKILL.md             │
  │  STEP 2 · Read: skills/s8-code-review/resources/           │
  │                 code-review-guide.md                       │
  │           → Read: task-reviewer-matrix.md                  │
  │  STEP 3 · Write submit(n).md for this task's code          │
  │           → read: resources/submit-template.md             │
  │           → Fill Task Scope field: Task ID + Type          │
  │           → Diff MUST contain this task's changes ONLY     │
  │  STEP 4 · Select reviewers from task-reviewer-matrix.md    │
  │           based on the task's type tag:                    │
  │             [frontend]  → impl + frontend-specialist       │
  │             [backend]   → impl + backend-specialist        │
  │             [database]  → impl + database-specialist       │
  │             [infra]     → impl + infra-specialist          │
  │             [fullstack] → impl + backend + frontend        │
  │  STEP 5 · Spawn reviewers. Wait for review(n).md.          │
  │  STEP 6 · If CHANGES_REQUESTED → S9 Bug Fix               │
  │           If LGTM from ALL → next task or S10              │
  │                                                             │
  │  ⏭ SKIP condition: mode = /trivial only                     │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S9 · Bug Fix Loop                               [MANDATORY] │
  │                                                             │
  │  STEP 1 · Fix ALL reviewer findings from review(n).md      │
  │  STEP 2 · Re-run S7 (tests MUST pass again)                │
  │  STEP 3 · Send changelog message to reviewers              │
  │  STEP 4 · If still CHANGES_REQUESTED → loop S9            │
  │           If LGTM from ALL → mark task [x]                 │
  │  STEP 5 · If more tasks remain → loop back to S6           │
  │           If all tasks [x] → proceed to S10                │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S10 · Commit                                    [MANDATORY] │
  │                                                             │
  │  STEP 1 · Read: skills/s10-git-commit/SKILL.md             │
  │  STEP 2 · Read: skills/s10-git-commit/resources/           │
  │                 commit-examples.md                         │
  │           → Read: breaking-change-guide.md                 │
  │  STEP 3 · Gate: all tasks must be [x] in task.md          │
  │  STEP 4 · Run: git diff --stat HEAD                        │
  │           (or commands/measure-diff.ps1)                   │
  │           → Count insertions                               │
  │           → If > 150: read commit-split-guide.md first<STRICTLY COMPULSORY always>     │
  │  STEP 5 · Stage ONLY changed files using git add <file>    │
  │           ════════════════════════════════════             │
  │           [HARD] git add . is PROHIBITED.                  │
  │           ════════════════════════════════════             │
  │  STEP 6 · Write commit message: Conventional Commits fmt   │
  │           Subject: max 72 chars, imperative mood           │
  │           Body: always present, lowercase, max 150 chars   │
  │  STEP 7 · Commit. Verify git status is clean.              │
  └──────────────────────┬──────────────────────────────────────┘
                         │
  ┌──────────────────────▼──────────────────────────────────────┐
  │ S11 · Update GEMINI.md                          [MANDATORY] │
  │                                                                                                 │
  │  STEP 1 · Read: skills/s11-gemini-update/SKILL.md          │
  │  STEP 2 · Read: skills/s11-gemini-update/resources/        │
  │                 gemini-schema.md                           │
  │  STEP 3 · Gate: git status must be clean                   │
  │  STEP 4 · Run: git ls-files             │
  │           → For each new file: insert into GEMINI.md §4    │
  │             directory structure (surgical, never replace)  │
  │  STEP 5 · Update per section (never delete, append only):  │
  │           §1 Overview — if project purpose changed         │
  │           §2 Architecture — add new patterns/decisions     │
  │           §3 Tech Stack — add new deps introduced          │
  │           §4 Directory — add new files (from Step 4)       │
  │           §5 Open Features — mark completed [x], add new   │
  │           §6 Session History — append new entry            │
  │  STEP 6 · Read: resources/global-skill-suggester.md        │
  │           → Emit 1–3 skill suggestions                     │
  │  STEP 7 · Emit final loop signal:                          │
  │           "Start new conversation → S1"                    │
  └─────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════
 HARD RULES (agent must acknowledge before starting)
═══════════════════════════════════════════════════

  1. Read GEMINI.md BEFORE any source file. No exceptions.
  2. Read each SKILL.md BEFORE executing that step.
  3. Write CHECKLIST.md to disk at S1. Tick it at every step.
  4. Code EXACTLY one task per S6→S7→S8 cycle. [HARD STOP].
  5. NEVER use git add . — always stage per-file.
  6. NEVER invoke S8 if any test is failing.
  7. NEVER create implementation_plan.md as an artifact.
     Use .agents/session-[SHA]/plan.md exclusively.
  8. LGTM from ALL reviewers required. One CHANGES_REQUESTED
     blocks and loops to S9.

═══════════════════════════════════════════════════
 ANTI-DRIFT DIRECTIVE
═══════════════════════════════════════════════════

  You MUST NOT drift from this workflow for any reason.
  If you feel an urge to skip a step, check your CHECKLIST.md.
  If a step is not ticked, it has not been done — do it now.
  Speed is not the goal. Correctness is the goal.
  You are a senior engineer on a production team, not a hackathon.
  ```
