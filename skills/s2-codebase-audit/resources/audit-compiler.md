# Audit Compiler Instructions

## 1. Introduction and Purpose
This document provides the strict operational instructions for the "Compiler Subagent" during the final step of the S2 Codebase Audit phase. 
The compiler subagent is spawned after all individual domain auditors have written their respective `audit(n).md` files. 
Its sole responsibility is to synthesize these fragmented reports into a single, cohesive, and actionable `audit.md` document for the S3 Planning phase.
Without this compilation step, the S3 planning agent would be forced to read multiple overlapping reports, leading to context bloat and duplicate tasks.
The compiler subagent acts as the central intelligence that organizes the raw audit data into a prioritized format.
The orchestrating agent MUST provide these exact instructions to the compiler subagent when invoking it.
Failure to do so will result in an unstructured report that derails the remainder of the Agentic Engineering workflow.
The instructions below guarantee a standardized output format that all subsequent phases rely upon.

## 2. Mandatory Processing Steps
The compiler subagent MUST execute the following data processing steps on the raw audit inputs. 
Failure to execute these steps will result in a bloated, redundant audit report that overwhelms the S3 planning agent.
These steps enforce discipline on the raw data, ensuring that only unique, actionable findings survive into the final report.
The subagent MUST process the data sequentially according to the list provided below.
Skipping any of these processing steps will compromise the integrity of the audit and lead to incorrect task prioritization during S3.
- **Deduplication**: The subagent MUST identify and merge overlapping issues reported by different personas (e.g., if the Security Auditor and the Architecture Auditor both flag the same missing authorization check, merge it into one item).
- **Severity Sorting**: All findings MUST be explicitly tagged and sorted strictly by severity. The required order is CRITICAL > HIGH > MEDIUM > LOW.
- **Component Grouping**: Findings MUST be grouped logically by the component or file they affect (e.g., `UserService.java`, `Authentication Filter`), rather than being grouped by the auditor who found them.

## 3. Output Format Requirements
The final `audit.md` file produced by the compiler subagent MUST adhere to a strict structural format. 
The subagent MUST NOT omit any of the following required sections.
This standardized structure ensures that the S3 Planning phase can deterministically parse the findings and assign correct priority scores to the resulting tasks.
A consistent format also makes it easier for human developers to review the audit results and understand the project's technical debt.
The compiler subagent MUST format the final document using the exact sections defined below.
1. **Executive Summary**: A concise 2-3 paragraph overview of the codebase health, highlighting systemic issues and architectural drift.
2. **Metric Counts**: A quantitative breakdown showing the total number of issues found, categorized exactly by their severity (Critical, High, Medium, Low).
3. **Top 10 Critical Findings**: An ordered list of the most severe issues that block development or pose immediate security risks. If fewer than 10 critical issues exist, high-severity issues MUST be included to reach a count of 10.
4. **Component-Level Breakdown**: Detailed explanations of every issue, grouped by component, including explicit file paths and precise line numbers if the audit tool successfully extracted line metadata during the scan.
5. **Stack Pack Adherence**: A specific section detailing how well the codebase conforms to the mandatory stack pack constraints (e.g., Next.js `'use server'` rules, Spring Boot `@Transactional` rules).
