---
name: s5-plan-fix
description: Executes the plan remediation loop when S4 Plan Review requests changes, systematically resolving architectural criticisms, revising plan.md and task.md, and resubmitting for consensus review.
---

# S5 Plan Fix

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S5 Plan Fix phase within the `ideal-agentic-workflow` plugin. 
The S5 phase operates as an essential self-correction feedback loop when the proposed implementation plan fails to achieve unanimous approval during S4 Plan Review.
In undisciplined AI workflows, agents frequently ignore reviewer objections, plow ahead into code generation, or engage in superficial agreement without actually fixing the design.
The S5 phase eliminates this hazard by forcing the orchestrating agent to methodically parse all negative findings, resolve the root architectural tensions, update the plan, and resubmit for formal re-review.
The agent MUST NOT transition to S6 Coding until all reviewer concerns are resolved and unanimous LGTM consensus is secured in S4.

## 2. Hard Gating and Behavioral Rules
- **Consensus Requirement**: A single `CHANGES_REQUESTED` from any reviewer triggers S5. Progression to S6 is strictly blocked.
- **Root-Cause Resolution**: The agent MUST NOT use semantic hand-waving or superficial edits. If a reviewer flags a missing abstraction, circular dependency, or unsafe schema migration, the plan MUST be redesigned to eliminate that flaw.
- **Traceable Changelog**: Every resubmission MUST include an explicit resolution log linking each reviewer critique to its specific remediation in `plan.md`.

---

## 3. Mandatory Files to Read at this Step

Before revising the plan, the agent MUST explicitly read:
1. **Review Findings**:
   - `.agents/session-[SHA]/code-review/review/review(n).md` (All reviewer reports containing `CHANGES_REQUESTED` findings)
2. **Current Plan Artifacts**:
   - `.agents/session-[SHA]/plan.md` (The plan to be revised)
   - `.agents/session-[SHA]/task.md` (The task breakdown to be updated)
3. **Guidelines & Submission Templates**:
   - `skills/s4-plan-review/resources/plan-review-guide.md` (Review rubric and standards)
   - `resources/submit-template.md` (Schema for writing `submit(N+1).md` with fix changelog)

---

## 4. Plan Remediation Protocol

```text
┌────────────────────────────────────────────────────────┐
│ S4 Rejection: review(n).md has CHANGES_REQUESTED       │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 1: Ingest and Categorize Criticisms               │
│ - Parse all review(n).md files in code-review/review/   │
│ - Group findings by severity (CRITICAL / HIGH / MED)   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 2: Architectural Redesign                         │
│ - Re-consult stack packs and GEMINI.md invariants      │
│ - Redesign interfaces, boundaries, or schemas          │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 3: Surgical Artifact Updates                      │
│ - Update .agents/session-[SHA]/plan.md                 │
│ - Re-score and update task.md if task scope changed   │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│ Step 4: Resubmission Preparation                       │
│ - Write submit(N+1).md in code-review/submit/          │
│ - Include detailed "Response to Reviewers" changelog   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
               RETURN TO S4 PLAN REVIEW
```

### 3.1 Step 1: Ingest and Categorize Criticisms
The agent MUST open and read each `review(n).md` file in `.agents/session-[SHA]/code-review/review/`.
Extract:
- Specific architectural flaws (e.g., tight coupling, missing transaction boundaries).
- Security vulnerabilities (e.g., exposed endpoints, unauthenticated mutations).
- Ambiguous task descriptions or unrealistic task complexity.

### 3.2 Step 2: Architectural Redesign
The agent MUST rethink the design against the project's loaded stack pack (`resources/stacks/`).
Never compromise type safety or architectural boundaries to avoid work.
If an additional abstraction layer (service, repository, middleware) is needed, add it to the plan.

### 3.3 Step 3: Surgical Artifact Updates
1. Edit `.agents/session-[SHA]/plan.md` to integrate the resolved architecture.
2. If the task sequence, dependencies, or file touch points changed, update `.agents/session-[SHA]/task.md` using the priority rubric.
3. Update `.agents/session-[SHA]/CHECKLIST.md` notes.

### 3.4 Step 4: Prepare Resubmission
Create the next incremented submission file (e.g., `submit(1).md`) in `.agents/session-[SHA]/code-review/submit/` using `resources/submit-template.md`.
The submission MUST contain a **Response to Reviewers** section structured as:
- **Finding**: [Quote reviewer critique]
- **Resolution**: [Explain architectural changes made in plan.md]
- **Diff of Plan**: [Highlight new/modified plan sections]

## 4. Completion and Loop Transition
Once `submit(N+1).md` is written:
1. Re-invoke the S4 Plan Review skill (`skills/s4-plan-review/SKILL.md`).
2. Spawn the reviewers to evaluate `submit(N+1).md`.
3. Continue this cyclical process until unanimous LGTM is achieved.
