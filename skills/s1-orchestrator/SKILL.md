---
name: s1-orchestrator
description: "Use proactively as the mandatory Turn-1 entry point for every engineering task, bugfix, feature, refactor, performance trace, or codebase question to load GEMINI.md, classify the task track, and initialize .agents/session-[SHA]/."
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

### Phase Step 0: Mandatory `view_file` Execution Gate
Before running initialization scripts or scaffolding directories, the agent MUST explicitly call `view_file` on EVERY file listed below. Taking action without calling `view_file` violates **AP-009 (Unread Context Execution)**.

1. **Primary Project Specification & Rules**:
   - `GEMINI.md` (Read in full before opening any source code file)
   - `rules/AGENTS.md` (Global Behavioral Charter: `AP-001..AP-010`, `EP-01..EP-12`, and strict OOP/JSX modularity)
   - `resources/engineering-principles.md` (Detailed 12 Engineering Principles `EP-01..EP-12`)
2. **Session Initialization Resources & Automation**:
   - `skills/s1-orchestrator/resources/session-init.md` (Timestamp SHA generation and directory layout)
   - `resources/checklist-template.md` (Master execution checklist schema for `.agents/session-[SHA]/CHECKLIST.md`)
   - `commands/init-session.ps1` (Cross-platform PowerShell scaffolding script)
3. **Classic Mode & Empirical Track Playbooks (Read the routed track/mode)**:
   - `skills/s1-orchestrator/resources/fast-mode.md` (Single-task <= 3 files / <= 100 LOC, low-overhead mode rules)
   - `skills/s1-orchestrator/resources/trivial-mode.md` (Docs-only bypass rules)
   - `skills/s1-orchestrator/resources/duolithic-mode.md` (Dual-conversation R-Agent delegation rules)
   - `skills/s1-orchestrator/resources/tracks/bugfix-mode.md` (Live repro, trace/runtime forensics, minimal evidence fix)
   - `skills/s1-orchestrator/resources/tracks/perf-hillclimb-mode.md` (Baseline trace, mantra cascade, hillclimb loop)
   - `skills/s1-orchestrator/resources/tracks/prototype-mode.md` (Throwaway scratch exploration & variant switcher)
   - `skills/s1-orchestrator/resources/tracks/investigation-mode.md` (Read-only cited Q&A / git-history archaeology)
   - `skills/s1-orchestrator/resources/tracks/refactor-mode.md` (Contract-pinned structural simplification)
   - `skills/s1-orchestrator/resources/tracks/autonomous-mode.md` (Predicate-locked unattended loop + decision log)
   - `skills/s1-orchestrator/resources/tracks/visual-parity.md` (Baseline screenshot-diff visual migration)
4. **Stack Composition**:
   - `resources/stacks/_stack-composer.md` (Mapping detected tech stack to active stack packs & `resources/stack-rules/`)

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

1. Classify user intent using the **Option A Deterministic Routing Matrix**:
   | Intent / Trigger | Routed Track / Mode | Playbook / Resource |
   |---|---|---|
   | New feature, migration, cross-boundary architecture | **Standard (`S2 -> S11`)** or **Spec (`SP1 -> SP6`)** | `skills/s3-planning/SKILL.md` / `skills/spec-architect-pipeline/SKILL.md` |
   | Defect, regression, trace/runtime forensics (`/bugfix`) | **Bugfix Track** | `skills/s1-orchestrator/resources/tracks/bugfix-mode.md` |
   | Latency, memory, throughput, hillclimb (`/perf`, `/hillclimb`) | **Perf/Hillclimb Track** | `skills/s1-orchestrator/resources/tracks/perf-hillclimb-mode.md` |
   | Layout/API design fork (`/prototype`) | **Prototype Track** | `skills/s1-orchestrator/resources/tracks/prototype-mode.md` |
   | Read-only code Q&A / architecture why (`/investigate`) | **Investigation Track** | `skills/s1-orchestrator/resources/tracks/investigation-mode.md` |
   | Behavior-preserving cleanup (`/refactor`) | **Refactor Track** | `skills/s1-orchestrator/resources/tracks/refactor-mode.md` |
   | Unattended predicate loop (`/autonomous`, `/goal`) | **Autonomous Track** | `skills/s1-orchestrator/resources/tracks/autonomous-mode.md` |
   | Pixel-exact UI migration (`/visual-parity`) | **Visual Parity Track** | `skills/s1-orchestrator/resources/tracks/visual-parity.md` |
   | Explicit classic modifiers (`/fast mode`, `/trivial`, `/duolithic mode`) | **Fast / Trivial / Duolithic** | `skills/s1-orchestrator/resources/fast-mode.md`, `skills/s1-orchestrator/resources/trivial-mode.md`, `skills/s1-orchestrator/resources/duolithic-mode.md` |
   If ambiguous between tracks, default safely to **Standard Track (`S2 -> S11`)** or route through `skills/workflow-guide/SKILL.md` when the user only asked which workflow to use.
2. Write the identified mode/track slug (e.g., `standard`, `bugfix`, `perf-hillclimb`, `prototype`, `investigation`, `refactor`, `autonomous`, `visual-parity`, `fast`, `trivial`, `duolithic`) to `.agents/session-[SHA]/mode.txt`.
3. Explicitly read the matching resource/track file so phase overrides, planning rules, and verification requirements are active in context.

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
