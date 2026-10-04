---
name: s7-testing
description: "Executes the mandatory automated testing and verification gate, enforcing static typing, linting, and domain-driven targeted test passes before permitting S8 Code Review."
---

# S7 Automated Testing

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S7 Automated Testing phase within the `ideal-agentic-workflow` plugin. 
The S7 phase functions as the uncompromising automated gatekeeper between code generation (S6) and human/subagent peer review (S8).
In standard "vibe coding", agents declare features complete without verifying that the codebase still compiles, passes type checks, or runs clean test suites.
The S7 phase completely eliminates this failure mode by requiring verifiable terminal evidence that every automated check passes with an exit code of 0.
The orchestrating agent MUST NOT attempt to invoke S8 Code Review or declare any task finished while compiler errors, lint warnings, or failing tests exist.
Adhering to this protocol guarantees that peer reviewers only inspect code that is syntactically, architecturally, and functionally verified by machines.

---

## 2. Mandatory Files to Read at this Step

Before executing tests or running verification commands, the agent MUST explicitly read:
1. **Targeted Test Command Registry & Scripts**:
   - `skills/s7-testing/resources/test-commands.md` (Domain-Driven Targeted Testing commands across all supported tech stacks)
   - `commands/verify-stack.ps1` (Automated stack verification runner supporting `-Target` domain filtering)
2. **Quality & Anti-Appeasement Guidelines**:
   - `resources/test-driven-development-guide.md` (Unit test design patterns, slice testing, and assertions)
   - `rules/AGENTS.md` (Rule AP-004: Strict ban on compiler appeasement, `@ts-ignore`, and silenced tests)
3. **Session Context & Task Target**:
   - `.agents/session-[SHA]/task.md` (Identify active task domain to construct targeted test filter)
   - `.agents/session-[SHA]/CHECKLIST.md` (Track S7 verification gate completion)

---

## 3. Hard Gating and Behavioral Rules
The integrity of the development loop hinges on absolute verification before review. 
The agent MUST explicitly internalize and enforce the following invariants during S7 execution:

- **The Absolute Gating Rule**: "NEVER invoke S8 code review if any automated test is failing."
- **Proof of Execution**: The agent MUST run the test commands via the terminal tool and observe the actual output and exit code. Hallucinating, mocking, or assuming test success without running the command is a critical workflow violation.
- **Domain-Driven Targeted Testing (DTT) Mandate**:
  - In repositories with dozens or hundreds of tests (e.g., 200+ tests across the suite), running the entire test suite on every atomic task iteration wastes immense AI quota and wall-clock time.
  - During the **inner task cycle (S6 → S7 → S8)**, the agent MUST execute **Targeted Domain-Driven Tests**—the specific unit, slice, and integration tests directly testing the domain class, service, or component modified by the active task.
  - Example: If the active task implemented `TransactionHistory`, the agent MUST execute ONLY the domain test class (e.g., `mvn test -Dtest=TransactionServiceTest`, `.\gradlew.bat test --tests "*TransactionServiceTest*"`, `npx vitest run src/services/TransactionHistory.test.ts`).
  - **Full Suite Pre-Commit Gate**: The full repository test suite is executed ONLY once, at the final **S10 Pre-Commit Gate**, to confirm zero global regressions before committing to git.
- **Strict Anti-Appeasement Rule**: The agent MUST NOT disable tests, suppress compiler warnings, or add `@ts-ignore` / `any` / `# noqa` annotations to artificially pass tests (see AP-004).

---

## 4. The Three-Tier Verification Hierarchy
Before passing to S8, the agent MUST execute the verification suite in a structured three-tier sequence. 
If any tier fails, the agent MUST immediately stop, diagnose the failure, and return to S6 to remediate.

```text
┌──────────────────────────────────────────────┐
│ Tier 1: Static Type Checking                 │
│ (e.g., tsc --noEmit, mypy, cargo check)      │
└──────────────────────┬───────────────────────┘
                       │ PASS
┌──────────────────────▼───────────────────────┐
│ Tier 2: Linting & Code Hygiene               │
│ (e.g., eslint, ruff check, cargo clippy)     │
└──────────────────────┬───────────────────────┘
                       │ PASS
┌──────────────────────▼───────────────────────┐
│ Tier 3: Domain-Driven Targeted Tests         │
│ (e.g., mvn test -Dtest=XTest, vitest path)   │
└──────────────────────┬───────────────────────┘
                       │ PASS
                       ▼
             PROCEED TO S8 REVIEW
```

### 4.1 Tier 1: Static Type Checking
The agent MUST verify that the codebase compiles cleanly with strict type validation.
Any unresolved type mismatch, broken import, or missing generic signature must be caught here.

### 4.2 Tier 2: Linting & Code Hygiene
The agent MUST run the project's configured linter to verify formatting standards, unused variables, and style adherence.
Warnings treated as errors by the repository's configuration must be fixed before proceeding.

### 4.3 Tier 3: Domain-Driven Targeted Automated Tests
The agent MUST execute the targeted test suites covering the modified domain classes or components.
If the active task added new functionality, corresponding automated tests for that functionality MUST be executed and verified green.

---

## 5. Test Command Execution Protocol by Stack

The agent MUST read `skills/s7-testing/resources/test-commands.md` and extract the target test command based on the touched task:

| Stack | Tier 1 (Type/Compile) | Tier 2 (Lint) | Tier 3 Targeted Domain Test (Inner Loop) |
| :--- | :--- | :--- | :--- |
| **Java / Spring (Maven)** | `mvn test-compile` | `mvn checkstyle:check` | `mvn test -Dtest={Target}Test` |
| **Java / Spring (Gradle)**| `.\gradlew.bat compileJava` | `.\gradlew.bat checkstyleMain` | `.\gradlew.bat test --tests "*{Target}Test*"` |
| **Postgres + Hibernate** | `.\gradlew.bat compileJava` | `.\gradlew.bat checkstyleMain` | `.\gradlew.bat test --tests "*{Target}RepositoryTest*"` |
| **Next.js / Vitest** | `npx tsc --noEmit` | `npm run lint` | `npx vitest run path/to/{Target}.test.ts` |
| **Next.js / Jest** | `npx tsc --noEmit` | `npm run lint` | `npx jest path/to/{Target}.test.ts --bail` |
| **Python / Pytest** | `python -m mypy .` | `ruff check .` | `pytest tests/unit/test_{target}.py -v` |
| **Rust / Cargo** | `cargo check` | `cargo clippy -- -D warnings` | `cargo test {target}` |
| **Minecraft Fabric** | `.\gradlew.bat build -x test`| `.\gradlew.bat check` | `.\gradlew.bat test --tests "*{Target}*"` |
| **Minecraft NeoForge**| `.\gradlew.bat compileJava` | `.\gradlew.bat check` | `.\gradlew.bat test --tests "*{Target}*"` |

---

## 6. Failure Loopback Protocol (S7 → S6)
If any command in Tiers 1–3 exits with a non-zero code or reports failures:
1. **Log Failure Evidence**: Capture the specific file, line number, and error trace.
2. **Halt Progression**: Under NO circumstances may the agent generate `submit(n).md` or invoke S8 reviewers.
3. **Revert Task State**: In `.agents/session-[SHA]/task.md`, ensure the task remains marked as in-progress (`[/]`).
4. **Transition to S6 Remediation**: Return to S6 Coding to fix the root cause of the error.
5. **Re-Verification Gate**: Once fixed, the agent MUST re-run the targeted S7 suite from Tier 1 to Tier 3.

---

## 7. S9 Bug Fix Re-Verification Gate
When the workflow loops from S8 back to S9 Bug Fix due to reviewer `CHANGES_REQUESTED`:
- After implementing fixes in S9, the agent MUST re-execute this S7 testing skill in full.
- No code may be resubmitted to reviewers in S8 without clean S7 verification evidence attached.

---

## 8. Completion Criteria
The S7 phase is successfully completed when:
1. All three verification tiers (Typecheck, Lint, Targeted Domain Test) exit with code 0.
2. The agent has captured terminal output proving test execution.
3. The S7 checkbox for the active task in `.agents/session-[SHA]/CHECKLIST.md` is marked complete (`[x]`).
4. The workflow is ready to generate `submit(n).md` and invoke S8 reviewers.
