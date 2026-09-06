# Plan Review Guide

## 1. Introduction and Purpose
This document defines the strict criteria that all plan-reviewer subagents MUST utilize when evaluating an implementation plan during the S4 phase. 
The plan review acts as an impenetrable quality gate, preventing poorly scoped or architecturally unsound logic from reaching the coding phase. 
Without this explicit set of evaluation criteria, reviewers risk rubber-stamping the orchestrator's output without conducting a meaningful analysis.
By enforcing these specific checks, the `ideal-agentic-workflow` plugin guarantees that every proposed code change aligns with the project's long-term health.
Every plan-reviewer MUST cross-reference the proposed `plan.md` against the rules defined below.
The reviewer MUST issue a rejection if the plan violates any single criterion in this document.
Compromising on these checks inevitably leads to regressions, performance bottlenecks, and mounting technical debt.
Reviewers MUST NOT rely on intuition; they MUST trace every proposed change back to the foundational architecture constraints.

## 2. Core Review Dimensions
The review process is divided into three non-negotiable dimensions that the critic MUST analyze simultaneously. 
The reviewer MUST verify that the proposed logic does not violate the established stack pack rules for the repository.
The reviewer MUST guarantee that the plan adequately addresses the critical findings identified in the previous S2 audit phase.
The reviewer MUST scan the proposed implementation steps for known anti-patterns documented in the project's registry.
Failing to examine all three dimensions guarantees that critical flaws will slip into the production codebase.
Each dimension carries equal weight in the evaluation process.
A failure in any single dimension constitutes an automatic rejection of the entire implementation plan.
The reviewer MUST evaluate the plan against the exact criteria outlined below.

### 2.1 Stack Pack Adherence
The plan-reviewer MUST evaluate every proposed change against the specific architecture rules defined in the active stack packs (e.g., `web-nextjs-turborepo.md`). 
The reviewer MUST ensure that the plan does not propose patterns explicitly forbidden by the chosen framework.
If the plan introduces a direct conflict with the stack's defined best practices, the reviewer MUST reject it immediately.
The reviewer MUST explicitly cite the violated stack pack rule in their `review(n).md` output to provide actionable feedback.
The reviewer MUST examine the following architectural boundaries.
- **Routing and File Structure**: Verify that the plan places files in the correct framework directories (e.g., Next.js App Router vs. Pages Router).
- **State Management**: Verify that the plan proposes the correct state management paradigm defined for the project (e.g., Server Components vs. Client Components).
- **Data Access Patterns**: Verify that database interactions conform to the designated ORM or query builder rules.

### 2.2 Audit Report Coverage
The plan-reviewer MUST read the `.agents/session-[SHA]/audit/audit.md` file and verify that the proposed plan addresses the high-priority vulnerabilities identified within it. 
A plan that focuses exclusively on new features while ignoring critical security warnings from the audit MUST be rejected.
The reviewer MUST trace the tasks in the plan back to the specific audit findings to guarantee complete coverage.
If a critical audit finding is deliberately deferred, the reviewer MUST verify that the plan includes a valid, documented justification for the delay.
The reviewer MUST assess the following coverage metrics.
- **Security Mitigation**: Verify that the plan proposes explicit fixes for any active vulnerabilities flagged during S2.
- **Performance Remediation**: Verify that the plan addresses severe performance bottlenecks or memory leaks identified by the auditors.
- **Technical Debt Reduction**: Verify that the plan allocates time to refactor deprecated API usage or convoluted logic flows.

### 2.3 Anti-Pattern Prevention
The plan-reviewer MUST analyze the proposed logic flow to intercept any known anti-patterns before they manifest as code. 
The reviewer MUST cross-reference the plan against the project's central anti-pattern registry located in the resources directory.
If the plan suggests a brittle implementation, such as hardcoding environment variables or writing monolithic functions, the reviewer MUST reject it.
The reviewer MUST mandate that the plan adopts defensive programming practices and robust error handling mechanisms.
The reviewer MUST actively hunt for the following conceptual flaws.
- **Simulation Code**: Verify that the plan strictly prohibits the generation of mock data, placeholders, or non-production simulation logic.
- **Verbose Comments**: Verify that the plan does not encourage writing excessive, narrative comments inside the source files.
- **Compiler Appeasement**: Verify that the plan does not propose suppressing warnings or bypassing type safety solely to force a successful build.
