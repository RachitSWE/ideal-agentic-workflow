# Duolithic Mode Protocol

## What This Resource Does

This document details the operational protocol for Duolithic Mode within the workflow. 

The reader of this document is the M-Agent (the primary Claude agent orchestrating the session). 

The purpose of this protocol is to define how the M-Agent delegates heavy review tasks to the R-Agent. 

The R-Agent is a secondary Gemini agent running in a separate, parallel conversation. 

By splitting the workload, we leverage Claude's superior reasoning for implementation while using Gemini's higher quota for parallel subagent spawning. 

This prevents quota exhaustion during intensive audit and review phases. 

The M-Agent MUST follow this protocol exactly when `/duolithic mode` is detected. 

Failure to follow this protocol will result in a breakdown of inter-agent communication.

## The Handoff Mechanism

The M-Agent and R-Agent do not communicate directly via an API. 

Instead, they use the user as a bridge and the filesystem as a shared state repository. 

The M-Agent generates an Onboarding Prompt that the user pastes into the R-Agent's conversation. 

The R-Agent executes its subagents, writes the output to the filesystem, and signals completion. 

The M-Agent then reads the output file and resumes the workflow. 

This asynchronous handoff MUST be strictly managed to avoid race conditions.

We MUST rely on precise file paths to ensure the R-Agent writes exactly where the M-Agent expects to read.

### Generating the Onboarding Prompt

When the workflow reaches a phase delegated to the R-Agent (S2, S4, or S8), the M-Agent MUST generate a specific prompt. 

This prompt instructs the R-Agent on its exact responsibilities. 

It MUST be presented to the user in a clearly demarcated code block. 

The prompt MUST include absolute paths to prevent resolution errors in the R-Agent's context.

Without this prompt, the user cannot correctly instruct the R-Agent.

Precondition: The M-Agent has reached S2, S4, or S8 in a Duolithic session.

1. Determine the current task type (`AUDIT`, `PLAN_REVIEW`, or `CODE_REVIEW`).
   - Expected Output: The correct context string is selected based on the phase.
2. Compile the `R-AGENT ONBOARDING PROMPT` using the template provided below, substituting all bracketed variables with actual absolute paths and SHA values.
   - Expected Output: A fully resolved prompt text block.
3. Output the prompt to the user inside a code block, accompanied by instructions to paste it into the R-Agent conversation and return when finished.
   - Expected Output: The workflow pauses, waiting for the user's return signal.

Postcondition: The M-Agent is paused, waiting for the R-Agent's output file to appear on the filesystem.

## R-Agent Onboarding Prompt Template

The following template MUST be used verbatim, replacing only the bracketed variables. 

It ensures the R-Agent receives all necessary constraints and context. 

The template strictly forbids the R-Agent from modifying source code. 

It also mandates the exact completion signal the R-Agent must output.

Any deviation from this template MAY cause the R-Agent to hallucinate or misbehave.

```text
--- R-AGENT ONBOARDING PROMPT ---

You are the Reviewer Agent (R-Agent) in a Duolithic Agentic Engineering session.

## Your Role
You are operating as a specialized review coordinator. You do NOT write production code.
Your ONLY job is to execute the review/audit task described below and write the output file to the exact path specified.

## Session Context
- Project root: [ABSOLUTE_PROJECT_PATH]
- Session SHA: [6_CHAR_SHA]
- GEMINI.md path: [PROJECT_ROOT]/GEMINI.md
- Session dir: [PROJECT_ROOT]/.agents/session-[SHA]/

## Your Task
[TASK_TYPE: AUDIT | PLAN_REVIEW | CODE_REVIEW]

[TASK-SPECIFIC CONTEXT]:
- For AUDIT: "Read every source file listed in GEMINI.md's directory structure. Spawn 5 audit subagents using the personas defined in the persona-library."
- For PLAN_REVIEW: "Read plan.md at [PATH]. Spawn 3 plan-reviewer subagents."
- For CODE_REVIEW: "Read submit([N]).md at [PATH]. Spawn 4 code-reviewer subagents."

## Subagent Count
Spawn [N] subagents as specified above. Do NOT reduce this count.

## Output
Write your compiled output to: [EXACT_OUTPUT_PATH]
Follow the template schema exactly (audit-template / review-template).

## Completion Signal
When all subagents have successfully returned their review files, output EXACTLY this line (nothing else):
RAGENT_DONE: [OUTPUT_FILE_PATH]

## Strict Rules
- Do not write any production code.
- Do not modify any source files.
- Do not modify GEMINI.md.
- Output file must match the template schema exactly.
--- END ONBOARDING PROMPT ---
```

This prompt block acts as the payload for the R-Agent, ensuring it receives all context before launching subagents.
