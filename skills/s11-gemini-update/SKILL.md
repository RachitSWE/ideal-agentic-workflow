---
name: "S11 GEMINI.md Update"
description: "Executes the final documentation sync, enforcing strict non-destructive schemas to maintain project context before closing the loop."
---

# S11 GEMINI.md Update

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S11 GEMINI.md Update phase within the `ideal-agentic-workflow` plugin. 
The S11 phase is the crucial finalization step that synchronizes the project's central knowledge base with the new reality established by the S10 commit.
The orchestrating agent MUST execute the protocols defined below to guarantee that the `GEMINI.md` file remains accurate, comprehensive, and structurally pristine.
Failing to update this document or corrupting its contents destroys the foundation of context that all future AI sessions rely upon to function correctly.
This rigorous approach ensures that the project documentation evolves monotonically alongside the codebase without losing historical data.
The orchestrating agent MUST strictly manage the file modifications, emit strategic skill suggestions, and officially close the workflow loop.
Failure to properly execute this phase leaves the session in an incomplete state and compromises the success of subsequent workflows.
The S11 phase explicitly marks the boundary between the current session and the start of a new, contextually fresh conversation.

## 2. Hard Gating and Modal Update Rules
The integrity of the documentation update relies entirely on the agent verifying that the repository state is perfectly clean before modifying the knowledge base. 
The agent MUST explicitly verify the following absolute gating rule before attempting any changes to `GEMINI.md`.
The agent MUST acknowledge the absolute prohibition: "No S11 before commit is clean."
If the `git status` reveals uncommitted changes, staged files, or untracked modifications related to the task, the agent MUST loop back to S10 and finalize the commit.
Once the progression gate is cleared, the agent MUST apply the correct update constraints based on the active session mode.
For Standard and Duolithic Modes, the agent MUST enforce the core rules: "Update only sections that changed. Never remove user-authored sections."
The agent MUST explicitly mandate the inviolable rules: "Never rename sections" and "never shorten the directory structure."
For Fast Mode, the agent MUST apply the override: "Lightweight update — only Section 5 (Open Features) if applicable."
For the Trivial Protocol, the agent MUST apply the override: "Skip S11 (no knowledge base update needed for doc-only changes)."

### 2.1 Finalization and Loop Closure Protocol
Before executing any modifications, the agent MUST explicitly instruct itself to read `resources/gemini-schema.md` to internalize the strict non-destructive editing boundaries. 
The agent MUST surgically apply its updates to `GEMINI.md` using precise file editing tools, ensuring zero unintended deletions occur.
Once the documentation is successfully synchronized, the agent MUST instruct itself to read `resources/global-skill-suggester.md`.
The agent MUST emit 1 to 3 highly contextual Global Skill Suggestions to the user, based on the friction points observed during the session.
After presenting the skill suggestions, the agent MUST formally terminate the workflow sequence by emitting the exact loop signal to the user.
The agent MUST mandate emitting the explicit loop signal at the very end: "Start new conversation → S1".
The agent MUST NOT perform any further actions after emitting this final signal.
