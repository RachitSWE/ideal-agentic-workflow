---
name: "S10 Git Commit"
description: "Executes the final staging and commit phase, strictly enforcing conventional commit formatting, atomic sizing, and workflow completion gates."
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

## 2. Hard Gating and Modal Sizing Rules
The integrity of the commit history relies entirely on the agent verifying that all assigned work is actually finished before modifying the git tree. 
The agent MUST explicitly verify the following absolute gating rule before running any `git commit` commands.
The agent MUST acknowledge the absolute prohibition: "No commit before all tasks [x] in task.md."
If any task in the `.agents/session-[SHA]/task.md` file remains incomplete or marked as in-progress (`[/]`), the agent MUST immediately loop back to S6 Coding.
Once the progression gate is cleared, the agent MUST apply the correct commit sizing constraints based on the active session mode.
For Standard and Duolithic Modes, the agent MUST adhere to the sizing rule: "~50-150 insertions per commit (guideline)."
The agent MUST "never split atomic units", and if a commit exceeds 150 insertions, the body MUST contain "one sentence explaining why this is one atomic unit".
For Fast Mode, the agent MUST apply the override: "No size target — commit what the fix requires."
For the Trivial Protocol, the agent MUST apply the override: "Single commit with type `docs` or `chore`."

### 2.1 Commit Formatting Protocol
Before finalizing the git commit message, the agent MUST explicitly instruct itself to read `resources/commit-examples.md` and `resources/breaking-change-guide.md`. 
The agent MUST study these resources to ensure its drafted message exactly matches the project's rigid stylistic requirements.
The agent MUST enforce the core formatting rules: the subject line MUST be a maximum of 72 characters, imperative mood, and follow the Conventional Commits format.
The agent MUST include a mandatory blank line between the subject and the body.
The agent MUST ensure the body is always present, entirely lowercase, and restricted to a maximum of 150 characters (excluding breaking change footers).
The agent MUST apply the `BREAKING CHANGE:` footer precisely as defined in the guide if the commit introduces incompatible API modifications.
The agent MUST NOT generate commits that violate these structural boundaries under any circumstances.
The agent MUST meticulously review its drafted commit message against these constraints before execution.
