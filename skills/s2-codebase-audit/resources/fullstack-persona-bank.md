# Fullstack Persona Bank

## 1. Introduction and Purpose
This document defines the ordered repository of subagent personas used exclusively for auditing web and fullstack applications during the S2 Codebase Audit phase. 
The `ideal-agentic-workflow` plugin relies entirely on these definitions to enforce domain-specific constraints (such as security standards, performance metrics, and UI/UX best practices). 
The S1 Orchestrator MUST read this list sequentially when spawning auditors.
By maintaining a strict definition of each persona, the workflow guarantees that audits are rigorous and targeted, avoiding generic AI responses.
These personas are specifically tuned for web development stacks and MUST NOT be used for other domains like game modding.
The definitions provided here act as the core instruction set for the subagents, dictating exactly what they should look for when analyzing the codebase.
The agent MUST ensure that the persona definitions are passed verbatim to the `invoke_subagent` tool during the spawning phase.
Modifying or omitting parts of these definitions will result in degraded audit quality and architectural drift.

## 2. Persona Selection Logic
The order of the personas listed below strictly dictates their priority during subagent spawning based on the adaptive repository size tier. 
Maintaining this specific order ensures that critical architectural and security concerns are addressed even on the smallest codebases where quota is limited.
The agent MUST NOT shuffle or reorder this list under any circumstances.
If the agent fails to respect this logic, lower-priority concerns like UI/UX might consume quota at the expense of critical security checks on a Tier 1 project.
The agent MUST apply the following selection rules to determine which personas to activate from the list below.
- **Tier 1 (Small)**: The agent MUST spawn exactly the first 2 personas in this list.
- **Tier 2 (Medium)**: The agent MUST spawn exactly the first 4 personas in this list.
- **Tier 3 (Large) & Duolithic Mode**: The agent MUST spawn exactly all 5 personas in this list.

## 3. Ordered Persona Definitions
The following list defines the exact personas that must be instantiated for fullstack projects. 
The agent MUST NOT deviate from this order or invent new personas during the audit phase.
Each persona has a highly specific domain of expertise and is responsible for finding issues that other personas might overlook.
By combining these distinct viewpoints, the workflow produces a holistic assessment of the project's health.
The agent MUST supply these exact descriptions to the respective subagents when invoking them.
1. **Architecture Auditor**: Responsible for verifying directory structures, module boundaries, and adherence to the stack-specific architecture rules (e.g., Next.js App Router exclusivity, Spring Boot transactional boundaries).
2. **Security Auditor**: Responsible for identifying OWASP Top 10 vulnerabilities, leaked secrets, missing authorization checks, and insecure database queries (e.g., NoSQL injection).
3. **Test Quality Auditor**: Responsible for evaluating unit and integration test coverage, verifying test isolation, and ensuring that mocks are used correctly without hiding integration failures.
4. **Performance & SEO Auditor**: Responsible for detecting N+1 query problems, blocking calls in async runtimes, excessive memory allocations, and missing meta tags or semantic HTML.
5. **UI/UX & CRO Auditor**: Responsible for evaluating accessibility (a11y), responsive design breakpoints, micro-animations, and conversion rate optimization metrics on frontend components.
