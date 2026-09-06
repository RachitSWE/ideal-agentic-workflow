# Anti-Pattern Registry

## 1. Introduction and Purpose
This document defines the definitive registry of forbidden coding practices within the `ideal-agentic-workflow` plugin. 
The core philosophy of this workflow dictates that speed is never a virtue if it comes at the expense of architectural integrity or maintainability. 
Without this explicit registry, autonomous coding agents often default to generating brittle, performative code that appears functional but collapses under real-world usage.
By strictly defining and prohibiting these specific behaviors, the workflow guarantees that all generated code adheres to the highest senior developer standards.
The executing agent MUST cross-reference every line of generated code against these defined anti-patterns before declaring a task complete.
The agent MUST immediately rewrite any logic that violates these constraints, regardless of whether the code compiles successfully.
Allowing any of these anti-patterns to slip into a commit violates the fundamental behavioral rules outlined in the project's PRD.
The agent MUST enforce the following four mandatory constraints across all generated files.

## 2. Core Anti-Patterns
The following sub-sections detail the specific coding behaviors that are strictly forbidden during the S6 Coding phase. 
These constraints are not merely guidelines; they are non-negotiable hard rules that dictate the quality of the final output.
The agent MUST treat the presence of any of these patterns as a critical failure requiring immediate remediation.
The overarching goal is to produce lean, self-documenting, production-ready code that matches existing project idioms.
The agent MUST rigorously analyze its own output against these four explicitly named anti-patterns.
The agent MUST guarantee that the final commit contains zero instances of these prohibited structures.
If a reviewer during S8 Code Review detects any of these patterns, the agent MUST accept the rejection and rewrite the implementation.
The agent MUST strictly enforce the following specific prohibitions.

### 2.1 AP-001: Zero Simulation or Mock Code
The agent MUST NOT generate placeholder data, hardcoded mock responses, or simulation logic under any circumstances. 
Writing fake implementations gives a false sense of progress while offloading the actual engineering work onto future tasks.
If a feature requires a database query, the agent MUST write the actual query using the project's designated ORM.
If an external API is required, the agent MUST implement the real HTTP client logic.
The agent MUST ensure the generated code is completely production-ready.

### 2.2 AP-002: Zero Verbose Comments
The agent MUST NOT clutter the source code with narrative, conversational, or overly explanatory comments. 
Code MUST be self-documenting through clear variable naming, well-structured functions, and explicit type definitions.
Adding paragraphs of comments explaining basic language syntax or obvious logic flows degrades readability and creates maintenance burdens.
The agent MUST restrict comments exclusively to documenting non-obvious business logic, complex algorithms, or necessary hacks.
The agent MUST delete any generated comments that merely restate what the code does.

### 2.3 AP-003: Zero TODO or FIXME Comments
The agent MUST NOT leave `TODO`, `FIXME`, or `PENDING` comments in the generated codebase. 
The purpose of the S6 phase is to complete the assigned task entirely; leaving a `TODO` is an explicit admission of incomplete work.
If a task cannot be fully implemented due to missing dependencies, the agent MUST halt execution and request user intervention.
The agent MUST NOT commit partial implementations that rely on future developers to finish the logic.
The agent MUST ensure that every line of code written represents a finalized, working state.

### 2.4 AP-004: Zero Compiler Appeasement
The agent MUST NOT bypass type safety, suppress linter warnings, or violate architectural boundaries simply to force a successful compilation. 
Using `any` types in TypeScript, `// @ts-ignore` directives, or forced unwrap operators in Swift are strictly forbidden unless explicitly authorized by the project rules.
Compiler errors indicate a fundamental misunderstanding of the data flow or the framework's constraints.
The agent MUST solve the underlying architectural issue rather than masking it with unsafe type casting or suppressed warnings.
The agent MUST guarantee that the code compiles cleanly while adhering to the strictest type safety settings available.
