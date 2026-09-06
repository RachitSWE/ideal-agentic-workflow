# Stack Detector Instructions

## 1. Introduction and Purpose
This document provides the mandatory protocol for identifying the current technology stack during the S6 Coding phase. 
Because the `ideal-agentic-workflow` plugin operates across diverse projects ranging from web applications to Minecraft mods, the coding agent must adapt its architectural approach dynamically. 
Without a mechanism to detect the active stack, the agent risks generating code that violates the project's foundational framework rules (e.g., mixing Next.js Pages router logic into an App router project).
By enforcing this detection protocol, the workflow ensures that all generated code is highly specific, idiomatic, and framework-compliant.
The agent MUST execute these detection steps at the very beginning of the S6 phase, before writing a single line of production code.
The agent MUST NOT rely on internal assumptions or general language knowledge; it must strictly adhere to the rules defined in the corresponding stack pack.
Failure to detect and apply the correct stack pack guarantees that the plan reviewers will reject the implementation.
The agent MUST rigorously follow the detection and loading sequence defined below.

## 2. Stack Detection Protocol
The identification of the active technology stack is a deterministic process relying entirely on the project's primary knowledge base. 
The agent MUST NOT attempt to infer the stack by arbitrarily scanning source files or package configuration files, as this is prone to error and misinterpretation.
The definitive source of truth for the project's architecture is explicitly documented within the `GEMINI.md` file.
The agent MUST read this central document to determine which specific architectural constraints apply to the current task.
Once identified, the agent MUST locate and load the corresponding instruction files from the plugin's resource directory.
The agent MUST apply these rules consistently across all code generation tasks in the current session.
The agent MUST execute the following exact steps to secure the architectural context.
The agent MUST NOT proceed to coding if the stack pack file cannot be located.

### 2.1 Read GEMINI.md Technology Stack
The agent MUST open and parse the `GEMINI.md` file located at the root of the project workspace. 
The agent MUST locate the specific section detailing the "Technology Stack" or "Architecture" to identify the primary frameworks in use.
If the project utilizes multiple frameworks (e.g., a React frontend and a Spring Boot backend), the agent MUST identify the stack relevant to the specific task at hand.
The agent MUST extract the exact framework names and versions defined by the user in this document.
The agent MUST use this extracted information to determine which stack pack applies.

### 2.2 Load Applicable Stack Packs
After identifying the framework from `GEMINI.md`, the agent MUST locate the corresponding file within the `resources/stacks/` directory. 
The agent MUST read the contents of this stack pack (e.g., `web-nextjs-turborepo.md` or `mc-fabric.md`) completely into its active context.
The agent MUST explicitly memorize the "Architecture Rules" and "Common Anti-Patterns" defined within that specific stack pack.
The agent MUST apply these loaded rules to every line of code generated during the S6 phase, ensuring total compliance with the project's idiomatic constraints.
The agent MUST explicitly verify its implementation against these rules before concluding the task.
