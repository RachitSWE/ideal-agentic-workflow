# Fast Mode Protocol

## What This Resource Does

This document defines the strict operational protocol for Fast Mode within the S1-S11 workflow. 

The reader is the AI agent orchestrating the session after `/fast mode` has been detected. 

The purpose of this protocol is to safely accelerate the workflow for well-scoped, low-risk tasks. 

It explicitly outlines which phases are modified, reduced, or skipped entirely. 

By following this protocol, the agent avoids unnecessary overhead while maintaining strict safety invariants. 

The agent MUST follow these rules exactly, as they override the Standard Mode defaults. 

Failure to follow these rules could result in unchecked scope creep or unreviewed code.

It is absolutely forbidden to skip phases not explicitly authorized by this document.

## S2 Codebase Audit Modification

In Fast Mode, the codebase audit is conditionally reduced to save time and quota. 

We assume that for a fast fix, a full 5-agent audit is unnecessary if recent context exists. 

However, we MUST still ensure the architecture and domain logic are respected. 

This prevents the agent from making isolated fixes that break global patterns.

We MUST check the timestamp of the existing `audit.md` before making a decision.

Precondition: The S2 phase is starting in a Fast Mode session.

1. Check for the existence of `audit.md` in the project root or previous sessions.
   - Expected Output: The agent determines if a prior audit exists.
2. If `audit.md` exists and is less than 7 days old, skip the S2 phase entirely.
   - Expected Output: The workflow proceeds directly to S3 without spawning auditors.
3. If it does not exist or is older than 7 days, run S2 with exactly 2 auditors (Architecture + the domain auditor matching the stack's primary technology).
   - Expected Output: A targeted, reduced-scope audit is generated.

Postcondition: The S2 phase is either skipped based on recency or executed with a minimal team.

## S3 Planning Modification

The planning phase MUST be simplified to match the reduced scope of the task. 

In Standard Mode, the agent calculates priority rubrics and handles multiple tasks. 

In Fast Mode, we assume the user has provided a single, specific issue to fix. 

The agent MUST write a minimal, single-task plan inline without the full rubric calculation.

We MUST restrict the session to exactly one task.

Precondition: The S3 phase is starting in a Fast Mode session.

1. Create the `plan.md` artifact inline, focusing only on the immediate fix.
   - Expected Output: A minimal implementation plan is drafted.
2. Create the `task.md` artifact containing exactly one task item.
   - Expected Output: The task list is restricted to a single objective.

Postcondition: A simplified plan and single-item task list are ready for execution.

## Skipping S4 Plan Review

The Plan Review phase (S4) is explicitly skipped in Fast Mode. 

This mode inherently trusts the developer's scoping and the agent's initial plan. 

Because the task is trivial or highly isolated, peer review of the plan itself is unnecessary overhead. 

The agent MUST proceed directly from S3 to S5/S6.

We MUST NOT spawn any Plan Critic subagents.

Precondition: The S3 phase has completed successfully.

1. Skip the generation of `submit(n).md` for the plan.
   - Expected Output: No submit file is generated.
2. Skip spawning the plan-reviewer subagents.
   - Expected Output: The workflow transitions immediately to the coding phase.

Postcondition: The agent proceeds to code generation without waiting for plan approval.

## S8 Code Review Modification

The Code Review phase (S8) MUST still execute, but with reduced reviewer count. 

While the plan may skip review, the actual implementation MUST always be verified. 

In Fast Mode, we reduce the reviewer count from 2 to 1 to speed up the loop. 

This single reviewer MUST be the `implementation-reviewer` persona.

We MUST ensure tests pass (S7) before invoking this reviewer.

Precondition: The S7 automated testing phase has passed successfully.

1. Prepare the `submit(n).md` file containing the task's code changes.
   - Expected Output: The submission file is ready for review.
2. Spawn exactly 1 code-reviewer subagent using the `implementation-reviewer` persona.
   - Expected Output: A single reviewer evaluates the code against the rules.

Postcondition: The code is reviewed by a single specialized agent.

## Strict Escalation Guard

Fast Mode is not a license for silent scope creep or massive refactoring. 

If the agent discovers during S6 (Coding) that the change is larger than anticipated, it MUST halt. 

This prevents the agent from hiding massive architectural changes inside a "fast" loop. 

The threshold for escalation is touching more than 3 files or writing more than 100 lines of code.

We MUST ask the user before proceeding if this threshold is crossed.

Precondition: The agent is actively modifying files in the S6 Coding phase.

1. Monitor the number of files modified and the total lines changed.
   - Expected Output: The agent tracks the current delta size.
2. If the delta exceeds 3 files or 100 lines, immediately pause execution.
   - Expected Output: The coding phase is halted.
3. Prompt the user: "This change is larger than expected (>3 files or >100 lines). Escalate to Standard Mode?"
   - Expected Output: The user decides whether to continue in Fast Mode or escalate.

Postcondition: The agent either escalates to Standard Mode or receives explicit permission to continue in Fast Mode.

## S10 Commit Target Modification

In Fast Mode, the standard guidelines for commit sizing do not apply. 

Normally, the agent aims for 50-150 lines per commit to ensure atomic units. 

Since Fast Mode is designed for very small, single-issue fixes, there is no size target. 

The agent MUST commit whatever changes the fix requires as a single logical unit. 

We MUST still use the Conventional Commits format for the commit message.

Precondition: The S9 Bug Fix loop (if any) is complete and all tasks are `[x]`.

1. Stage all files related to the Fast Mode fix.
   - Expected Output: The git index contains all necessary changes.
2. Formulate a single Conventional Commit message covering the entire fix without splitting it.
   - Expected Output: The commit message is generated correctly.

Postcondition: The codebase is updated with a single, properly formatted commit.

## S11 GEMINI.md Lightweight Update

The final phase of the workflow is updated to reflect the targeted nature of Fast Mode. 

Instead of scanning all of `GEMINI.md` for potential updates, the agent MUST perform a lightweight update. 

The update MUST strictly be limited to Section 5 (Open Features) if the fix resolves a tracked issue. 

This saves time and prevents unintended modifications to the broader project architecture documentation. 

If the fix was completely unmentioned in Section 5, `GEMINI.md` is left untouched.

Precondition: The S10 commit has been successfully created.

1. Check if the task resolved an issue explicitly listed in `GEMINI.md` Section 5.
   - Expected Output: The agent determines if documentation needs updating.
2. If yes, remove or update the corresponding entry in Section 5 only.
   - Expected Output: Section 5 reflects the completed feature or fix.

Postcondition: The project documentation is accurately maintained with minimal overhead.
