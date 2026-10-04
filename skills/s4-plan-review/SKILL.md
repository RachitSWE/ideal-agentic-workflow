---
name: s4-plan-review
description: "Executes the critical quality gate, spawning specialized subagents to evaluate the implementation plan against architectural constraints and audit findings."
---

# S4 Plan Review

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S4 Plan Review phase within the `ideal-agentic-workflow` plugin. 
The S4 phase acts as the primary defense mechanism against flawed logic, preventing poorly conceived implementation plans from reaching the coding stage. 
The orchestrating agent MUST execute the protocols defined below to guarantee that autonomous plan-critic subagents thoroughly evaluate the proposed architecture.
Skipping this phase in Standard or Duolithic modes violates the core invariant that all generated plans MUST be peer-reviewed before execution.
This rigorous review cycle mimics the human pull request process, ensuring that multiple expert personas validate the strategy against project constraints.
The orchestrating agent MUST prepare the exact inputs required by the subagents and handle the resulting feedback deterministically.
Failure to properly orchestrate this review will result in the deployment of brittle, non-compliant code that degrades the repository's health.
The S4 phase explicitly determines whether the workflow advances to coding or loops back to planning for necessary revisions.

---

## 2. Mandatory Files to Read at this Step

Before and during execution of S4, the agent MUST explicitly read:
1. **Plan Review Persona & Guidelines**:
   - `agents/plan-critic.md` (Persona definition for spawning plan-critic subagents)
   - `skills/s4-plan-review/resources/plan-review-guide.md` (Checklist, scoring criteria, and consensus gates)
2. **Review Submission & Output Templates**:
   - `resources/submit-template.md` (Schema for writing `.agents/session-[SHA]/code-review/submit/submit(0).md`)
   - `resources/review-template.md` (Schema for reviewer verdicts in `.agents/session-[SHA]/code-review/review/review(n).md`)
3. **Active Plan Artifacts**:
   - `.agents/session-[SHA]/plan.md` (The implementation plan under review)
   - `.agents/session-[SHA]/task.md` (The prioritized task list)

---

## 3. Modal Execution Protocols
The exact behavior of the S4 phase is strictly governed by the operating mode established during the S1 Orchestration phase. 
The agent MUST evaluate the current mode from the `.agents/session-[SHA]/mode.txt` file (or its internal state) and execute the corresponding protocol branch.
Applying the wrong protocol wastes time spawning unnecessary subagents or dangerously bypasses the review for complex, high-risk changes.
The Fast Mode and Trivial Protocol explicitly trust the developer's initial scoping and skip this phase entirely to maximize execution speed.
Conversely, the Standard and Duolithic modes mandate a rigorous, multi-agent review process to guarantee architectural safety.
The agent MUST strictly adhere to the mutually exclusive branches of logic defined below based on the active session mode.
The agent MUST NOT attempt to blend these instructions; a session is either fully reviewed or explicitly bypassed based on the mode.
If the operating mode is unclear, the agent MUST default to the Standard mode protocol to guarantee that safety is never compromised.

### 2.1 Fast, Trivial, and Skip List Bypass
When the session is explicitly marked as `/fast mode`, `/trivial`, or when the user's session skip list explicitly contains "S4", the agent MUST completely bypass the entire S4 Plan Review phase. 
These modes and overrides are designed for low-risk, tightly scoped changes or direct developer overrides where the initial direction does not require secondary validation.
Spawning plan-critic subagents when bypassed constitutes an unnecessary expenditure of AI quota and wall-clock time.
The agent MUST NOT prepare a `submit(n).md` file or spawn any reviewers under these specific protocols.
The agent MUST immediately advance the workflow directly to the S6 Coding phase, trusting the plan generated during S3.

### 2.2 Standard Mode Protocol
When operating in Standard Mode, the agent MUST execute the native, multi-agent review process within the current conversation context. 
This protocol guarantees that the proposed plan is scrutinized by objective subagents dedicated solely to architectural compliance.
The agent MUST prepare the `.agents/session-[SHA]/code-review/submit/submit(n).md` file containing the `plan.md` contents and the `plan-review-guide.md` instructions.
The agent MUST spawn exactly two (2) plan-reviewer subagents utilizing the `plan-critic.md` persona defined in the persona bank.
The agent MUST wait for both subagents to generate their respective `.agents/session-[SHA]/code-review/review/review(n).md` output files before proceeding to evaluation.

### 2.3 Duolithic Mode Protocol
When operating in Duolithic Mode, the orchestrating M-Agent MUST delegate the entire review process to the R-Agent operating in a parallel conversation. 
This protocol balances the superior reasoning capabilities of the primary model against the higher quota limits required for parallel subagent spawning.
The M-Agent MUST NOT spawn any plan-critic subagents directly within its own execution context.
The M-Agent MUST generate the specific handoff prompt defined below, present it to the user, and explicitly pause its own execution until the R-Agent completes the task.
The M-Agent MUST execute the following exact sequence to guarantee a seamless transition across the dual-conversation architecture.
- **Prompt Generation**: The M-Agent MUST generate the exact R-Agent Onboarding Prompt template defined in PRD Section 4.4.
- **Context Injection**: The M-Agent MUST insert the precise string: `"Read plan.md at [PATH]. Spawn 3 plan-reviewer subagents."` into the `[TASK-SPECIFIC CONTEXT]` block of the prompt.
- **Explicit Pause**: The M-Agent MUST explicitly halt execution and instruct the user to paste the prompt into the R-Agent conversation.
- **Completion Signal**: The M-Agent MUST strictly wait for the user to return the exact completion signal: `RAGENT_DONE: [OUTPUT_FILE_PATH]` before resuming operations and reading the generated review files.

## 3. Transition Logic and Evaluation
Regardless of whether the reviews were generated via Standard Mode or Duolithic Mode, the orchestrating agent MUST rigorously evaluate the final `review(n).md` outputs. 
This evaluation determines the immediate next step in the workflow lifecycle, enforcing the rule that unapproved plans cannot proceed to execution.
The agent MUST read the conclusions of all spawned plan-critics and aggregate their final verdicts.
If the reviewers reach a consensus, the agent MUST advance the workflow; if a single reviewer objects, the plan MUST be revised.
The agent MUST strictly follow the transition logic defined below based on the aggregated review status.
Failure to enforce this logic breaks the fundamental invariant of the agentic engineering process.
This explicit transition gate prevents subjective interpretation of the review results.
The agent MUST execute one of the following two transition pathways.

### 3.1 Approval Transition (S6 Code One Task)
If all plan-reviewer subagents explicitly approve the implementation plan without requesting mandatory changes, the plan is considered verified. 
The orchestrating agent MUST mark the S4 phase as complete and immediately transition the workflow to the S6 Coding phase.
The agent MUST select the first incomplete task from the `task.md` file and begin generating production code.
The agent MUST ensure the `task.md` file is accurately updated as the coding phase commences.
The agent MUST NOT modify the approved `plan.md` file after this transition occurs.

### 3.2 Rejection Transition (S5 Plan Fix)
If any single plan-reviewer subagent requests changes or rejects the proposed architecture, the plan is considered flawed. 
The orchestrating agent MUST explicitly transition the workflow to the S5 Plan Fix phase to remediate the identified issues.
The agent MUST read the specific criticisms from the `review(n).md` files, revise the `plan.md` and `task.md` artifacts accordingly, and loop back to the beginning of S4 to request a fresh review cycle.
This cyclical process MUST continue indefinitely until all architectural concerns are fully resolved.
The agent MUST NOT proceed to S6 until a flawless approval is secured from all designated reviewers.
