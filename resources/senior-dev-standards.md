# Senior Developer Standards & Engineering Charter

## 1. Executive Summary
This document establishes the gold standard for software engineering excellence within the `ideal-agentic-workflow` framework.
Autonomous agents acting on behalf of senior and principal engineers must not default to exploratory "vibe coding."
Every line of code, configuration file, test case, and commit MUST demonstrate intentional design, deterministic structure, and production-grade craftsmanship.

---

## 2. Core Pillars of Senior Engineering

### Pillar 1: Evidence Over Assertions
- A feature is never done until automated tests prove it.
- A bug is never fixed until a reproducing test first fails and subsequently passes.
- Code review is never passed on assumption; every diff must be scrutinized against stack-specific invariants.

### Pillar 2: Zero Simulation in Production Paths (AP-001)
- Never return dummy values, mock arrays, or placeholder responses in production services or controllers.
- If a downstream dependency or external service is not yet built, implement the real interface, configuration contracts, and error handling—do not leave fake `setTimeout` delays or hardcoded JSON responses.

### Pillar 3: Self-Documenting Architecture (AP-002)
- Code must express intent through clear naming, cohesive functions, and strong typing.
- Eliminate conversational AI commentary (`// Generated for task 3`).
- Comments are reserved exclusively for answering "WHY":
  - Documenting complex domain math or algorithms.
  - Explaining non-obvious workarounds for upstream library defects.
  - Recording deliberate trade-offs or performance rationales.

### Pillar 4: Type Soundness & Compiler Respect (AP-004)
- Types are contracts. Never appease the compiler by bypassing the type checker (`any`, `@ts-ignore`, blanket `except Exception`).
- When a type error occurs, resolve the root mismatch in the model or interface hierarchy.

### Pillar 5: Atomic, Deterministic Scoping
- Confine all changes strictly to the task boundaries specified in `task.md`.
- Never perform opportunistic, unrequested refactorings in adjacent modules.
- Ensure every commit represents a single atomic unit of work (~50–150 insertions) with tests and code co-located.

---

## 3. Layered Architecture & Boundary Discipline

| Layer | Responsibility | Allowed Invocations | Forbidden Behaviors |
| :--- | :--- | :--- | :--- |
| **Presentation / Controller** | HTTP routing, request deserialization, status codes, view rendering. | Service layer, DTO mappers. | Direct database queries, business transactions, entity exposure. |
| **Service / Application** | Business logic, transaction orchestration, domain events. | Domain models, Repositories, External Clients. | HTTP headers, session cookies, raw SQL execution. |
| **Domain / Entity** | Core business invariants, entities, value objects. | Pure functions, domain rules. | Framework dependencies, DB connection pools, HTTP types. |
| **Persistence / Repository** | Database querying, mapping, persistence adapters. | Database drivers, ORM entities, connection pools. | Business rule calculations, HTTP response generation. |

---

## 4. Memory & Token Budget Optimization (AP-006)

When performing agentic subagent dispatch:
1. **Targeted Payloads**: Subagents must receive only the specific file paths, diff snippets, and specification slices required to fulfill their mandate.
2. **Standardized Communication**: All subagent communication is mediated through disk files in `.agents/session-[SHA]/` (`submit(n).md`, `review(n).md`, `audit(n).md`).
3. **Structured Outputs**: Free-form conversational chatter is strictly minimized in favor of verified JSON or markdown schemas.

---

## 5. Senior Code Review Checklist (S8)

Before any reviewer subagent signs off with `LGTM`, it must verify:
- [ ] Correctness: Does the code fulfill the functional specification without regression?
- [ ] Concurrency: Are shared resources protected against race conditions, deadlocks, and pool starvation?
- [ ] Error Handling: Are edge cases, nullability, timeouts, and network interruptions handled cleanly?
- [ ] Security: Are user inputs sanitized, queries parameterized, and authentication tokens verified?
- [ ] Test Quality: Do tests verify behavioral contracts rather than implementation details?
- [ ] Observability: Are key operations logged with structured contexts and appropriate severity levels?
