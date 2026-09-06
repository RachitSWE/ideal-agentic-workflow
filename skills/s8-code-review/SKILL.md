---
name: "S8 Code Review"
description: "Orchestrates the rigorous peer review phase, strictly gating progression based on automated test results and multi-agent consensus."
---

# S8 Code Review

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S8 Code Review phase within the `ideal-agentic-workflow` plugin. 
The S8 phase is the uncompromising quality gate designed to prevent untested, flawed, or architecturally unsound code from progressing to the commit stage.
The orchestrating agent MUST execute the protocols defined below to guarantee that the peer review process remains objective, thorough, and completely isolated from the authoring context.
Bypassing this phase or manipulating the review outcomes violates the core tenets of the workflow and completely invalidates the integrity of the generated codebase.
This rigorous approach mimics a real-world engineering team where peer consensus is an absolute prerequisite for merging.
The orchestrating agent MUST strictly manage the creation of review requests, coordinate the reviewer subagents, and enforce the absolute gating rules.
Failure to properly execute this phase will result in the accumulation of technical debt and broken builds in the main branch.
The S8 phase explicitly bridges the gap between verified local testing and the final commit preparation.

## 2. Hard Gating and Behavioral Rules
The integrity of the review process relies entirely on strict adherence to the project's foundational behavioral constraints. 
The agent MUST explicitly verify the following gating rules before attempting to initiate any peer review sequence.
The agent MUST acknowledge the absolute prohibition: "NEVER invoke S8 code review if any automated test is failing."
If the S7 Testing phase reported any compiler errors, failing unit tests, or linter warnings, the agent MUST immediately loop back to S6 and fix the code.
Furthermore, the agent MUST obey the core behavioral rule: "NEVER write a review file yourself. Review MUST come from real subagents or R-Agent."
The agent MUST NOT attempt to fake a positive review to bypass the subagent invocation process.
The agent MUST explicitly verify these prerequisites before proceeding to submit the code.
The agent MUST enforce the following specific execution rules regarding submission and reviewer management.

### 2.1 Submit File Creation Protocol
Before spawning reviewers, the agent MUST formally document the changes by creating a `submit(N).md` file in the `.agents/session-[SHA]/code-review/submit/` directory. 
The agent MUST format this file meticulously to ensure the reviewers have all necessary context to perform a deep semantic evaluation.
The agent MUST include a clear task description detailing the original requirements and the implemented solution.
The agent MUST include a comprehensive list of all files changed and a detailed diff summary of the modifications.
The agent MUST include specific questions for the reviewers, highlighting complex logic or architectural decisions that require extra scrutiny.

### 2.2 Modal Reviewer Invocation
The agent MUST determine the exact number and type of reviewer subagents to spawn based on the active session mode. 
For Fast Mode, the agent MUST spawn exactly 1 reviewer utilizing the `implementation-reviewer` persona.
For Standard Mode, the agent MUST spawn exactly 2 reviewers utilizing the `implementation-reviewer` persona and one other persona specifically matched to the detected project type (e.g., `security-code-reviewer` for fullstack, or `game-performance-auditor` for minecraft).
For Duolithic Mode, the agent MUST NOT spawn subagents directly; instead, it MUST generate the explicit onboarding prompt: "Read submit([N]).md at [PATH]. Spawn 4 code-reviewer subagents."
After generating the Duolithic prompt, the agent MUST pause execution and wait for the exact `RAGENT_DONE` signal from the user.
If the active mode is Trivial Protocol, the agent MUST skip the S8 phase entirely and proceed directly to S10.

### 2.3 Patience Directive and Status Checking
The peer review process is computationally intensive and may require significant time to complete deep semantic analysis. 
The orchestrating agent MUST exhibit patience and refrain from interrupting or unnecessarily polling the reviewer subagents.
The agent MUST explicitly use the `schedule` tool to set a 300-second timer if the subagents are particularly slow to respond.
The agent MUST NOT spam status checks in a tight loop, as this wastes resources and clutters the session context.
The agent MUST patiently await the explicit arrival of the completed `review(n).md` files from the subagents or the R-Agent.

### 2.4 Progression and Iteration Loops
Upon receiving all requested reviews, the agent MUST evaluate the consensus to determine the next phase of the workflow. 
The agent MUST enforce the absolute progression gate: "LGTM from ALL reviewers required before proceeding. One CHANGES_REQUESTED blocks and loops to S9 Bug Fix."
If any reviewer requests changes, the agent MUST enter the S9 Bug Fix phase, resolve the issues, strictly re-run the S7 automated testing suite, and then send a message to the reviewers with a detailed changelog of what was fixed before requesting a re-review.
If ALL reviewers explicitly provide an `LGTM` (Looks Good To Me) approval, the agent MUST mark the current task as `[x]` (completed) in the `task.md` tracker.
Following a successful approval, the agent MUST loop back to S6 if incomplete tasks remain, or proceed directly to S10 Commit if all tasks are finished.
