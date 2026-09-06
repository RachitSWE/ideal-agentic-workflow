---
name: "S3 Planning"
description: "Executes the rigorous planning phase, reading audit reports and user inputs to produce prioritized task lists and implementation plans."
---

# S3 Planning

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S3 Planning phase within the `ideal-agentic-workflow` plugin. 
The S3 phase acts as the central intelligence hub, translating the raw diagnostic data from the S2 audit and the user's initial requests into a structured, executable roadmap. 
The agent MUST execute the protocols defined below to guarantee that no code is written without a thoroughly reviewed and prioritized plan in place.
Proceeding to the S6 Coding phase without fulfilling the S3 requirements violates the most fundamental invariant of Agentic Engineering.
This rigorous approach guarantees that developers and autonomous subagents maintain alignment on system architecture, priority, and scope before modifying the filesystem.
The orchestrating agent MUST read the operational mode from the session state to determine which specific planning protocol to apply.
Failure to follow the correct modal protocol will result in excessive quota usage or, conversely, inadequate planning for complex changes.
Without this central intelligence hub, subsequent execution phases would operate blindly and chaotically.
The agent MUST treat the generation of the `plan.md` and `task.md` files as its absolute highest priority before any code generation is allowed to occur.

## 2. Context Ingestion Requirements
Before generating any plans, the agent MUST consume all available context to form a complete mental model of the project's current state. 
Attempting to write a plan based solely on a single user prompt guarantees the introduction of regressions and the violation of established architectural patterns.
The S2 audit exists precisely to provide this context, and ignoring it renders the previous phase useless.
The agent MUST read the required files completely into memory before opening the `plan.md` or `task.md` files for writing.
If any of these foundational documents are missing, the agent MUST halt execution and inform the user of the critical failure.
The agent MUST read and analyze the following sources of truth.
1. **The Audit Report**: The agent MUST read `.agents/session-[SHA]/audit/audit.md` to understand the existing technical debt, security vulnerabilities, and stack pack violations.
2. **The Project PRD**: The agent MUST read `GEMINI.md`, paying specific attention to the "Open Features" section to align the plan with the long-term project roadmap.
3. **The User Request**: The agent MUST analyze the user's explicit prompt or bug report that initiated the current session.

## 3. Modal Execution Protocols
The exact behavior of the S3 phase is strictly governed by the operating mode established during the S1 Orchestration phase. 
The agent MUST evaluate the current mode from the `.agents/session-[SHA]/mode.txt` file (or its internal state) and execute the corresponding protocol.
Applying the wrong protocol wastes time on trivial tasks or dangerously under-plans complex architectural shifts.
The Fast Mode and Trivial Protocol are designed for efficiency, whereas the Standard/Duolithic modes are designed for rigorous safety.
The agent MUST strictly adhere to the mutually exclusive branches of logic defined below based on the active mode.
The different modes are carefully designed to prevent the workflow from becoming overly bureaucratic for simple bug fixes while retaining enterprise-grade oversight for large features.
The agent MUST NOT attempt to mix or blend the distinct instructions from different modal protocols.
If the operating mode is somehow unclear or missing from the session state, the agent MUST strictly default to the Standard mode protocol to guarantee maximum safety.
This defensive fallback mechanism ensures that complex architectural changes never slip through a bypassed or undocumented planning phase.

### 3.1 Standard and Duolithic Mode Protocol
When operating in Standard or Duolithic mode, the agent MUST execute the full, rigorous planning procedure. 
This protocol guarantees that complex tasks are broken down into atomic units and scored objectively to prevent scope creep and priority inversion.
The agent MUST NOT skip the rubric calculation step, as it is the sole mechanism for enforcing disciplined task ordering.
The agent MUST explicitly generate two separate artifacts and write them to the session directory.
1. **The Implementation Plan**: The agent MUST generate `.agents/session-[SHA]/plan.md`, detailing the specific code changes required to address the user request and the critical audit findings.
2. **The Prioritized Task List**: The agent MUST generate `.agents/session-[SHA]/task.md` by running every identified task through the `resources/priority-rubric.md` scoring formula (`Severity × Complexity × Dependencies`) and sorting the output sequentially.

### 3.2 Fast Mode Protocol
When the session is explicitly marked as `/fast mode`, the agent MUST bypass the rigorous multi-file planning process to prioritize speed for low-risk changes. 
Fast Mode trusts that the user has provided a tightly scoped, isolated task that does not require deep architectural prioritization.
The agent MUST NOT attempt to solve multiple issues or address unrelated audit findings while operating under this protocol.
The agent MUST execute the simplified planning procedure defined exactly below.
1. **Inline Planning**: The agent MUST write a minimal, single-task `plan.md` file inline without invoking the full mathematical rubric calculation.
2. **Single Task Restriction**: The agent MUST define exactly one task; multi-task sessions are strictly prohibited in Fast Mode and require escalation if attempted.

### 3.3 Trivial Protocol Bypass
When the session is explicitly marked as `/trivial`, the agent MUST completely bypass the entire S3 Planning phase. 
The Trivial Protocol is strictly reserved for changes that have zero impact on production logic, such as fixing documentation typos or updating markdown formatting.
Because these changes carry no risk of architectural regressions, generating formal implementation plans and task lists constitutes a waste of AI quota and wall-clock time.
The agent MUST NOT generate a `plan.md` or a `task.md` file under this protocol.
The agent MUST proceed immediately from the context ingestion phase directly to the execution phase.
