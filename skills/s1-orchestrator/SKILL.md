---
name: s1-orchestrator
description: Initializes the ideal-agentic-workflow session, reads GEMINI.md, generates the session SHA, detects the operating mode, and prepares the workspace for the S2 Audit phase.
---

# S1 Orchestrator

## What This Skill Does

This skill is the absolute entry point for the `ideal-agentic-workflow` plugin. 

It executes the "S1 Context Ingestion" phase defined in the PRD. 

The reader of this document is the AI agent initiating a new workflow session. 

The purpose of this skill is to establish the foundation for all subsequent steps. 

It creates the isolated session environment where all temporary state will reside. 

It also detects the project's technology stack and the user's requested operating mode. 

Without executing this skill first, the rest of the workflow will fail due to missing context.

We MUST run this skill successfully before opening any source code files.

---

## Mandatory Files to Read at this Step

Before and during execution of S1, the agent MUST explicitly read:
1. **Primary Project Specification & Rules**:
   - `GEMINI.md` (Read in full before opening any source code file)
   - `rules/AGENTS.md` (Global Senior Developer Invariants AP-001 through AP-008)
2. **Session Initialization Resources & Automation**:
   - `skills/s1-orchestrator/resources/session-init.md` (Timestamp SHA generation and directory layout)
   - `resources/checklist-template.md` (Master execution checklist schema for `.agents/session-[SHA]/CHECKLIST.md`)
   - `commands/init-session.ps1` (Cross-platform PowerShell scaffolding script)
3. **Mode Resources (Read corresponding mode detected)**:
   - `skills/s1-orchestrator/resources/fast-mode.md` (Single-task, low-overhead mode rules)
   - `skills/s1-orchestrator/resources/trivial-mode.md` (Docs-only bypass rules)
   - `skills/s1-orchestrator/resources/duolithic-mode.md` (Dual-conversation R-Agent delegation rules)
4. **Stack Composition**:
   - `resources/stacks/_stack-composer.md` (Mapping detected tech stack to active stack packs)

---

## Senior Developer Mindset

Before executing any other action in this skill, the agent MUST adopt the Senior Developer Mindset. 

You are joining a real engineering team, not a hackathon. 

Speed is not the goal; correctness, architecture-fit, and maintainability are paramount. 

You MUST deliberately review and plan before making changes. 

Rushing to write code without full context is a violation of this plugin's core philosophy.

For example, a Vibe Coding approach would immediately start modifying files to fix a reported bug. 

In contrast, the Senior Developer approach mandates reading `GEMINI.md` to understand the system invariants before even opening the buggy file.

This deliberate pacing prevents the creation of brittle workarounds that violate established patterns.

## First Action: Context Ingestion

The very first action the agent MUST take is reading the project's `GEMINI.md` file. 

This file is the single source of truth for the repository's architecture and rules. 

We MUST NOT assume anything about the codebase that is not documented here. 

Reading source files before reading `GEMINI.md` is a critical violation of the workflow invariants.

This guarantees that the agent adopts the correct context before making any decisions.

Precondition: The user has initiated a new workflow session in a project root containing `GEMINI.md`.

1. Execute the `view_file` tool targeting the absolute path to `GEMINI.md` in the project root.
   - Expected Output: The full contents of `GEMINI.md` are loaded into the agent's context.
2. Parse Section 2.3 (Technology Stack) to identify all technologies explicitly listed in the Stack section.
   - Expected Output: A list of detected stacks (e.g., "Next.js", "Spring Boot") is held in memory for later steps.

Postcondition: The agent possesses complete knowledge of the project's rules, directory structure, and technology stack.

## Session Resume Logic

Before initializing a completely new session, the agent MUST check if a previous, incomplete session exists. 

This prevents abandoning work halfway and cluttering the `.agents/` directory with orphaned tasks. 

If a previous session's `task.md` contains uncompleted items, the agent MUST give the user the choice to resume. 

We MUST NOT automatically overwrite or ignore past incomplete sessions. 

The user is the final arbiter of whether to continue past work or start fresh.

Precondition: The `.agents/` directory exists in the project root.

1. Scan the `.agents/` directory for any subdirectories starting with `session-`.
   - Expected Output: A list of existing session directories is identified.
2. If any exist, check their internal `task.md` file for any tasks that are not marked as `[x]`.
   - Expected Output: The agent determines if any session is incomplete.
3. If an incomplete session is found, output a message to the user: "Resume session [SHA] or start fresh?".
   - Expected Output: The workflow pauses, waiting for the user's decision on how to proceed.

Postcondition: The agent either resumes the specified previous session or proceeds to generate a new session SHA.

## Session SHA Generation and Directory Initialization

To isolate the current workflow from past or parallel sessions, we MUST generate a unique identifier. 

This identifier is used to create a dedicated working directory. 

All temporary files, plans, and review artifacts will be stored here. 

This prevents state corruption and allows for clean session resumption.

We MUST follow the specific SHA generation algorithm provided in the resources.

Precondition: Context ingestion is complete and no past session is being resumed.

1. Read the `skills/s1-orchestrator/resources/session-init.md` file to obtain the SHA generation algorithm.
   - Expected Output: The agent understands the timestamp-based SHA1 logic.
2. Execute the generation algorithm to produce a 6-character lowercase hex string.
   - Expected Output: A unique string like `e3f9a2` is generated.
3. Run the directory creation commands specified in `skills/s1-orchestrator/resources/session-init.md`.
   - Expected Output: The `.agents/session-[SHA]/` directory tree is created with all required subdirectories and stub files.

Postcondition: A pristine, isolated workspace is ready for the current session's artifacts.

## Mode Detection

The user MAY specify a specific operating mode by including a keyword in their prompt. 

These modes alter how subsequent phases behave. 

If no keyword is detected, the agent MUST default to Standard Mode. 

It is critical to detect this early so that downstream subagents are configured correctly.

We MUST record the detected mode in the session directory for persistence.

Precondition: The session directory tree has been initialized.

1. Analyze the user's initial prompt for mode trigger keywords (`/fast mode`, `/trivial`, `/duolithic mode`).
   - Expected Output: The requested mode (or the default Standard Mode) is identified.
2. Write the identified mode to `.agents/session-[SHA]/mode.txt`.
   - Expected Output: A file containing the mode string (e.g., "fast") exists.
3. Depending on the detected mode, read the corresponding resource file (`skills/s1-orchestrator/resources/duolithic-mode.md`, `skills/s1-orchestrator/resources/fast-mode.md`, or `skills/s1-orchestrator/resources/trivial-mode.md`).
   - Expected Output: The agent explicitly loads and understands the specific protocol rules for the requested mode.

Postcondition: The operating mode is permanently recorded and the agent knows which protocol to follow.

## Stack Detection and Persistence

The detected technology stack MUST be recorded so that S2 subagents can load the correct rules. 

This prevents downstream subagents from having to parse `GEMINI.md` independently. 

It ensures all agents in the session agree on the environment they are auditing. 

We MUST store this in a standardized format.

The `context.md` file serves as the communication medium for this state.

Precondition: The technology stack was identified during Context Ingestion and the session directory exists.

1. Read `resources/stacks/_stack-composer.md` to map detected technologies to their respective stack packs.
   - Expected Output: The agent assembles the list of applicable stack packs from `resources/stacks/`.
2. Create a `.agents/session-[SHA]/context.md` file following the schema in `_stack-composer.md`.
   - Expected Output: A new Markdown file is created in the session root.
3. Write the detected stack keywords and active stack pack paths into this file.
   - Expected Output: The file contains the structured stack data for downstream auditors and coders.

Postcondition: The project's stack context is persisted for use by S2 auditors.

## Terminal Usage Rules

The following rules govern all terminal interactions during the session. 

They exist to prevent state corruption, avoid path resolution errors, and ensure user safety. 

Running destructive commands without oversight can result in unrecoverable data loss. 

We MUST adhere to these constraints whenever executing bash commands.

Failure to follow these rules is a severe safety violation.

- Temp files MUST go in `.agents/session-SHA/` ONLY. Never in project root or system temp.
- Always use absolute paths in terminal commands to prevent silent failures.
- Do NOT run destructive commands (`rm -rf`, `git reset --hard`) without explicit user approval.
- Background commands MUST always set a schedule timer if waiting > 30 seconds.

## Completion Criteria

When S1 finishes, it MUST report its status to the user and prepare for S2. 

This transition relies on verifying that all expected artifacts exist. 

If any artifact is missing, S2 will crash or behave unpredictably. 

We MUST output a summary to confirm readiness.

This hands control back to the user or transitions to the next automated step.

Precondition: All previous S1 procedures have been executed.

1. Verify the existence of `.agents/session-[SHA]/mode.txt` and `context.md`.
   - Expected Output: Confirmation that persistent state files exist.
2. Verify the existence of the `audit/bin/`, `code-review/submit/`, and `code-review/review/` subdirectories.
   - Expected Output: Confirmation that the directory tree is complete.
3. Output a summary message to the user stating that S1 is complete and the agent is ready for S2.
   - Expected Output: The user sees a confirmation message in the chat interface.

Postcondition: The S1 Orchestrator has successfully completed its lifecycle and the workflow is ready for the S2 Codebase Audit.
