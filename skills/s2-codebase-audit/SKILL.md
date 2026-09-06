---
name: "S2 Codebase Audit"
description: "Executes the comprehensive multi-agent codebase audit based on repository size, ensuring all architectural and domain constraints are checked."
---

# S2 Codebase Audit

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S2 Codebase Audit phase within the `ideal-agentic-workflow` plugin. 
The audit phase operates as a mandatory gatekeeper that prevents architectural degradation and security vulnerabilities from compounding over time. 
The agent MUST follow the protocols defined below to correctly measure the project scale and bypass it only when explicitly allowed.
It must also manage the orchestration of multiple specialized auditor subagents without introducing race conditions or context bleed.
Executing this skill ensures that the S3 Planning phase receives a comprehensive, structured `audit.md` report as its foundational context.
This robust context is vital for the S3 phase to produce a realistic and complete task list.
Failing to adhere to this protocol will result in a superficial audit that misses deep-seated technical debt.
Therefore, the agent MUST read and implement every section of this document faithfully.

## 2. Fast Mode and Trivial Protocol Bypasses
The agent MUST evaluate the current operating mode before expending quota on a full codebase audit. 
Bypassing the audit incorrectly violates the core principles of Agentic Engineering and leaves the project vulnerable to regressions.
The S2 Codebase Audit phase is computationally expensive, so these bypass rules are designed to conserve quota for small, low-risk changes.
The agent MUST NOT invent new bypass conditions; it must strictly adhere to the conditions listed below.
The Trivial Protocol and Fast Mode are mutually exclusive, and their respective bypass logic is distinct.
If neither mode is active, the agent MUST execute the full standard audit process.
- **Trivial Protocol**: If the session mode is `/trivial`, the agent MUST skip the S2 phase entirely and proceed immediately to the documentation changes.
- **Fast Mode**: If the session mode is `/fast mode`, the agent MUST check the age of the `.agents/session-[SHA]/audit/audit.md` file (or the most recent audit file in the project). 
  - If the `audit.md` file exists and is $\le$ 7 days old, the agent MUST skip the S2 phase entirely.
  - If the `audit.md` file does not exist or is $> 7$ days old, the agent MUST execute the S2 phase, but MUST artificially cap the resources at **Tier 1 (Small)** regardless of actual repository size.

## 3. Adaptive Auditor Count and Sizing Logic
If the audit is not bypassed, the agent MUST measure the repository size to determine the exact tier of auditing required. 
The agent MUST NOT guess the tier; it must calculate it explicitly using the predefined formulas below.
The tier system ensures that small projects are not overwhelmed by unnecessary subagents, while large enterprise codebases receive the comprehensive review they require.
Accurate sizing prevents both quota waste and inadequate architectural oversight.
This section details the two mandatory sub-steps for this sizing process.
By splitting the measurement into file count and raw lines of code, the system mitigates edge cases involving huge generated files or massive numbers of empty configuration files.
The orchestrating agent MUST execute both measurements simultaneously before attempting to assign a tier.
If the measurements are somehow unavailable due to disk errors, the agent MUST abort the S2 phase rather than default to a lower tier.

### Repository Size Measurement
The first step in determining the audit tier is to establish concrete numerical metrics for the repository size.
The agent MUST calculate two distinct metrics: `file_count` and `loc_estimate`.
These two metrics provide a balanced view of the project's scale, accounting for both file sprawl and file density.
By calculating both, the agent avoids misclassifying repositories that have few very large files or many very small files.
The agent MUST follow the exact steps below to gather these metrics.
1. **File Count**: Calculate `file_count` as the total number of non-gitignored source files explicitly listed in `GEMINI.md` Section 4.
2. **LOC Estimate**: Calculate `loc_estimate` by scanning the `GEMINI.md` file list and spot-checking 5 representative files to generate a rough total Line of Code count.

### Tier Assignment Matrix
Once the size metrics are calculated, the agent MUST map them to a specific tier using the logic defined in this matrix.
This matrix establishes hard thresholds that dictate the exact number of auditors the orchestrator must spawn.
The agent MUST use the logical `OR` condition, meaning if either the file count or the LOC estimate triggers a higher tier, the higher tier MUST be selected.
The agent MUST strictly enforce these thresholds and MUST NOT spawn more or fewer auditors than the tier dictates.
- **Tier 1 (Small)**: `file_count <= 10` OR `loc_estimate <= 800`. The agent MUST spawn exactly 2 auditors.
- **Tier 2 (Medium)**: `file_count <= 40` OR `loc_estimate <= 4000`. The agent MUST spawn exactly 4 auditors.
- **Tier 3 (Large)**: `file_count > 40` OR `loc_estimate > 4000`. The agent MUST spawn exactly 5 auditors.

## 4. Subagent Spawning Protocol
Once the tier is determined, the agent MUST spawn the subagents according to strict concurrency and formatting rules. 
This ensures maximum efficiency and prevents context bleed between personas.
Orchestrating multiple subagents requires precise coordination to prevent duplicate work and ensure each persona stays focused on its domain.
The agent MUST adhere to the simultaneous invocation rule and the specific handling required for Duolithic mode.
These rules form the mechanical core of the S2 phase.
By launching all subagents at the exact same moment, the workflow minimizes overall wall-clock time spent in the audit phase.
Furthermore, enforcing explicit arguments for each subagent prevents prompt injection or context confusion where one auditor attempts to perform the job of another.
The orchestrating agent MUST construct the prompt payloads precisely as defined in this protocol before initiating the background tasks.

### Simultaneous Invocation
The agent MUST spawn all selected auditors simultaneously via a single `invoke_subagent` tool call. 
Sequential spawning is strictly prohibited, as it artificially extends the session duration and violates the concurrent design of the workflow.
To ensure each subagent receives the exact context it needs, the prompt must be highly detailed.
The agent MUST explicitly list the following arguments in the prompt for each individual auditor.
1. The absolute path to the project root.
2. The absolute path to the `GEMINI.md` file.
3. The complete textual persona definition from the specific persona bank (`resources/fullstack-persona-bank.md` or `resources/minecraft-persona-bank.md`).
4. The path to the audit template schema (`resources/audit-template.md`).
5. The exact output file path (`.agents/session-[SHA]/audit/bin/audit(N).md`).

### Duolithic Mode Handling
If the session is running in `/duolithic mode`, the standard `invoke_subagent` tool call MUST NOT be used for the audit phase. 
Duolithic mode relies on the R-Agent in a separate conversation to execute the intensive subagent spawning, conserving the M-Agent's context window.
The agent MUST coordinate this handoff perfectly to ensure the R-Agent has all necessary instructions.
The agent MUST artificially force the tier to **Tier 3 (Large)** to maximize the review depth during this offloaded phase.
The agent MUST follow the exact manual handoff sequence detailed below.
- Generate the complete R-Agent Onboarding Prompt containing all paths and instructions.
- Output this prompt clearly to the console for the user to copy.
- Explicitly pause execution and wait for the user to return the R-Agent's output path.

## 5. Strict Audit Rules and Compilation
The agent MUST enforce strict behavioral boundaries on the auditor subagents and guarantee the final report is compiled correctly. 
Tolerating lazy audits or incomplete reports fundamentally breaks the workflow integrity and jeopardizes the S3 Planning phase.
The subagents operate autonomously, meaning the orchestrating agent is responsible for validating their output.
This section details the behavioral enforcement rules and the final compilation step.
Without these guardrails, subagents might hallucinate file changes or submit empty reports when faced with complex architectural patterns.
The orchestrating agent acts as the supervisor, aggressively rejecting superficial findings.
Once the raw data is validated, the final compilation process ensures the raw insights are transformed into a structured, readable artifact.
The agent MUST follow both the behavioral checks and the compiler invocation exactly as specified below.

### Behavioral Enforcement
Auditor subagents are strictly designed for reading and analyzing code, not modifying it.
The agent MUST ensure these boundaries are respected and must challenge any subagent that fails to produce a rigorous audit.
Superficial "looks good to me" responses are unacceptable in Agentic Engineering.
The orchestrating agent MUST enforce the following constraints rigorously.
- Auditors MUST NOT modify any source files or artifacts under any circumstances; they are strictly read-only entities.
- If an auditor subagent returns an empty "LGTM" or "no issues found" message, the orchestrating agent MUST re-prompt the subagent, demanding it look deeper for anti-patterns defined in the stack packs.
- The agent MUST NEVER proceed to the S3 Planning phase if any of the spawned `audit(n).md` files are missing or incomplete.

### Audit Compilation
After all individual `audit(n).md` files have been written successfully to the `.agents/session-[SHA]/audit/bin/` directory, the raw data must be synthesized.
The individual reports contain overlapping insights and varying severity levels that must be organized.
The agent MUST invoke the final compiler subagent to perform this crucial data processing step.
This ensures the downstream planning agent receives a clean, actionable document.
The agent MUST provide the compiler subagent with the exact instructions from `resources/audit-compiler.md` to execute the synthesis.
- Instruct the compiler to deduplicate all overlapping issues.
- Instruct the compiler to sort the remaining issues strictly by severity (CRITICAL > HIGH > MEDIUM > LOW).
- Instruct the compiler to group findings by component and generate the final `audit.md` document.
