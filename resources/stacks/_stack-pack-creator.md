# Protocol: Creating a New Stack Pack

## 1. Introduction and Purpose
This document defines the mandatory protocol for creating a new stack pack within the `ideal-agentic-workflow` plugin. 
The plugin uses stack packs to enforce framework-specific constraints during the S2 Codebase Audit and S6 Coding phases. 
When a user's project introduces a technology stack that does not currently exist in the `resources/stacks/` directory, the agent MUST follow this protocol to research, structure, and generate a new stack pack. 
Executing this protocol ensures that all stack packs maintain uniform structure, enabling automated tools to reliably parse their constraints across any project.

## 2. Trigger and Approval
The process of creating a new stack pack is initiated automatically at the end of a session, but requires explicit user approval before proceeding. The S11 GEMINI Update phase is responsible for detecting the need for a new stack pack based on the project's technology stack.
- **Precondition**: The S1 Orchestrator detects a technology stack in `GEMINI.md` (Section 2.3) that has no corresponding `.md` file in the `resources/stacks/` directory.
1. During the S11 GEMINI Update phase, the agent MUST output the following prompt to the user: "No stack pack exists for [Stack Name]. Would you like me to create one?"
2. The agent MUST NOT generate or write the stack pack unless the user explicitly approves the request.

## 3. Research and Drafting
Once the user approves the creation of the stack pack, the agent must perform the necessary research to generate accurate constraints. The agent is expected to rely on its training data and web search tools to gather the most up-to-date best practices.
1. Use web search tools to research the stack's current version constraints, architectural best practices, and common anti-patterns.
2. Draft the pack following the exact 5-section format defined in Section 4 below.
3. Update `resources/fullstack-persona-bank.md` or `resources/minecraft-persona-bank.md` to include any new audit angles this stack introduces.

## 4. Required Stack Pack Structure
Every stack pack MUST contain exactly five sections, in the exact order listed below. Deviation from this structure causes S2 and S6 steps to miss expected sections, breaking the audit process. This format ensures consistency across all plugins.
1. **Version Constraint Matrix**: A table format showing supported versions, incompatible versions, and required dependencies (e.g., "Node.js 18+ required for Next.js 14").
2. **Architecture Rules**: Specific patterns the codebase MUST or MUST NOT use (e.g., "Server components MUST NOT import from `react`").
3. **Common Anti-Patterns**: Named and specific bad practices (e.g., "AP-NEXT-01: Client Component Data Fetching") that cause performance or maintenance issues.
4. **Audit Checklist**: A bulleted list of verifiable items an auditor can check against a given PR or file.
5. **Useful References**: Links to official documentation for the stack.

## 5. Review and Finalization
The newly drafted stack pack must be reviewed and persisted so it can be utilized in future sessions. This final step guarantees that only high-quality, verified constraints are added to the plugin's knowledge base.
1. Write the drafted content to `resources/stacks/[stack-name].md`.
2. Present the drafted stack pack to the user for review.
3. Apply any corrections the user requests.
- **Postcondition**: The `resources/stacks/` directory contains the new `[stack-name].md` file formatted with the 5 mandatory sections, and the persona bank is updated. Future sessions will load this pack automatically when the stack is detected.
