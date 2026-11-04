---
name: s6-coding
description: "Executes the core code generation phase, strictly enforcing senior developer standards, stack architecture rules, and anti-pattern prevention."
---

# S6 Coding

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S6 Coding phase within the `ideal-agentic-workflow` plugin. 
The S6 phase is the critical execution engine where the theoretically sound plans from S4 are transformed into functional, production-ready software. 
The orchestrating agent MUST execute the protocols defined below to guarantee that code is generated with a disciplined, senior-developer mindset rather than rapid, sloppy prototyping.
Skipping this phase or ignoring its constraints violates the core invariant that all generated code MUST be robust, maintainable, and free of architectural debt.
This rigorous approach ensures that the output is indistinguishable from code written by a highly experienced human engineer intimately familiar with the project.
The orchestrating agent MUST strictly manage task state, enforce coding idioms, and actively hunt for anti-patterns during generation.
Failure to properly execute this phase will result in the accumulation of technical debt, immediate rejection during S8 Code Review, and a degraded repository state.
The S6 phase explicitly bridges the gap between approved planning and automated testing.

## 2. Mandatory Files to Read at this Step

### Phase Step 0: Mandatory `view_file` Execution Gate
Before touching ANY source file, running commands, or creating classes, the orchestrating agent MUST explicitly call `view_file` on EVERY file listed below (global standards, anti-patterns, and active stack rules/pack). Coding without loading stack invariants into context violates **AP-009 (Unread Context Execution)**.

1. **Global Senior Developer Standards & Guidelines**:
   - `rules/AGENTS.md` (Global senior developer invariants AP-001 through AP-008)
   - `resources/senior-dev-standards.md` (Production engineering idioms, naming, and architectural alignment)
   - `resources/error-handling-guide.md` (Disciplined typed error patterns, eliminating catch-all suppressions)
   - `resources/test-driven-development-guide.md` (TDD conventions and test structure standards)
2. **Phase Guidelines & Anti-Pattern Registry**:
   - `skills/s6-coding/resources/anti-patterns.md` (Canonical catalog of forbidden anti-patterns: AP-001 through AP-008)
   - `skills/s6-coding/resources/stack-detector.md` (Signatures for detecting framework, runtime, and package conventions)
3. **Detected Stack Pack & Invariant Rules** (Load the active stack files identified during S1):
   - **Database Subsystems**:
     - `resources/stacks/database/mongodb.md` & `rules/rules-database-mongodb.md`
     - `resources/stacks/database/redis.md` & `rules/rules-database-redis.md`
     - `resources/stacks/database/postgresql.md` & `rules/rules-database-postgresql.md`
   - **Backend Subsystems**:
     - `resources/stacks/backend/backend-java.md` & `rules/rules-backend-java.md`
     - `resources/stacks/backend/java-databases.md` & `rules/rules-backend-java-databases.md`
     - `resources/stacks/backend/backend-python.md` & `rules/rules-backend-python.md`
     - `resources/stacks/backend/python-databases.md` & `rules/rules-backend-python-databases.md`
     - `resources/stacks/backend/backend-rust.md` & `rules/rules-backend-rust.md`
     - `resources/stacks/backend/rust-databases.md` & `rules/rules-backend-rust-databases.md`
   - **Frontend Subsystems**:
     - `resources/stacks/frontend/nextjs.md` & `rules/rules-frontend-nextjs.md`
     - `resources/stacks/frontend/angular.md` & `rules/rules-frontend-angular.md`
   - **Minecraft Modding Subsystems**:
     - `resources/stacks/minecraft/mc-fabric.md` & `rules/rules-minecraft-fabric.md`
     - `resources/stacks/minecraft/mc-forge.md` & `rules/rules-minecraft-forge.md`
   - **Stack Composer & Extensibility**:
     - `resources/stacks/_stack-composer.md`
4. **Specialist Subagent Personas** (Adopt or consult based on the detected stack and active task):
   - `agents/nextjs-turborepo-specialist.md` (Next.js 16, Turborepo, RSC boundaries, Server Actions)
   - `agents/angular-signals-specialist.md` (Angular 21+, Signals reactivity, Zoneless, Standalone)
   - `agents/spring-boot-specialist.md` (Java Spring Boot, Security, Transactions, Data JPA)
   - `agents/python-ai-specialist.md` (Python, FastAPI, LangChain, PyTorch, RAG Pipelines)
   - `agents/rust-systems-specialist.md` (Rust, Tokio async, Axum, Serde, memory safety)
   - `agents/database-postgres-prisma-specialist.md` (PostgreSQL, Prisma schema, transactions, migrations)
   - `agents/database-mongo-redis-specialist.md` (MongoDB, Redis caching, indexing, TTLs)
   - `agents/mc-fabric-specialist.md` (Minecraft Fabric, Loom, Yarn mappings, Mixin architecture)
   - `agents/mc-neoforge-specialist.md` (Minecraft NeoForge, ModDevGradle, Parchment, DeferredRegister)
5. **Session Plan & Task Context**:
   - `.agents/session-[SHA]/task.md` (Select lowest-indexed incomplete task)
   - `.agents/session-[SHA]/plan.md` (Approved architecture plan and component boundaries)
   - `.agents/session-[SHA]/context.md` (Active session operating mode and detected stacks)

---

## 3. The Senior Developer Mandate
The quality of the output in this phase relies entirely on the agent adopting the correct persona and operational mindset. 
The agent MUST explicitly adopt the following foundational mandate before generating any code, treating it as the highest behavioral directive.
> "You are a senior engineer on a production team. Speed is not the goal. Correctness, architecture-fit, and maintainability are your absolute priorities. You write lean, idiomatic code that respects existing patterns."
The agent MUST NOT generate boilerplate code; every line written MUST serve a distinct, necessary purpose for the feature.
The agent MUST ensure that all new implementations perfectly match the existing coding idioms and stylistic conventions found within the repository.
The agent MUST NOT invent new structural paradigms unless explicitly directed to do so by the approved `plan.md`.
The agent MUST verify its own output against this mandate continuously throughout the execution cycle.
The agent MUST strictly enforce the following specific execution rules and modal constraints.

### 3.1 Architectural Alignment and Task Selection
Before writing code, the agent MUST explicitly instruct itself to read `skills/s6-coding/resources/stack-detector.md` and subsequently load the applicable stack packs based on the `GEMINI.md` definitions. 
The agent MUST NOT attempt to write framework-specific logic without having the corresponding stack pack loaded into active memory.
Once the architecture is understood, the agent MUST select the lowest-indexed incomplete task from the `.agents/session-[SHA]/task.md` file.
The agent MUST immediately mark this selected task with the `[/]` notation to indicate that work is actively in progress.
The agent MUST isolate its focus to this single task, refusing to address unrelated issues or future steps until the current task is fully resolved.
Under RULE-ENG-02 (State Lineage & Layout Boundary Infrastructure), if the active task produces or consumes application state displayed in shared layout shells (Header, Sidebar, Navigation, Status Bar), updating the shared context provider or layout shell (`DashboardShell.tsx`, `_app.tsx`, `layout.tsx`) is classified as mandatory state infrastructure and is explicitly authorized.
Under RULE-ENG-01 (Closed Vertical Slices), the agent MUST connect all interactive mutations to real endpoints or concrete clients; disguising unfinished logic under "Local Demo" or "Preview" badges violates AP-001 and is strictly forbidden.

### 3.2 Anti-Pattern Enforcement and Post-Coding Check
During the actual code generation process, the agent MUST explicitly enforce all constraints defined in the `skills/s6-coding/resources/anti-patterns.md` registry. 
The agent MUST guarantee zero simulation code, zero verbose comments, zero TODOs, and zero instances of compiler appeasement.
Upon completing the code generation for the selected task, the agent MUST perform a rigorous self-audit before declaring the work finished.
The agent MUST mandate and execute this precise post-coding check: "Mentally check every named anti-pattern against the code just written. If any matches, fix before proceeding to S7".
The agent MUST NOT transition to the automated testing phase until it is absolutely certain no anti-patterns remain in the generated files.

### 3.3 Fast Mode Escalation Rule
When operating under Fast Mode, the agent is trusted to execute rapid, low-risk changes without a formal S4 plan review. 
However, Fast Mode is strictly not a license to silently engage in scope creep or execute massive architectural shifts under the radar.
The agent MUST constantly monitor the size and impact of its generated code during the Fast Mode execution cycle.
The agent MUST explicitly mandate the following Fast Mode escalation rule: if the agent discovers the necessary change exceeds 3 files or 100 lines of code, it MUST explicitly pause execution.
Upon pausing, the agent MUST ask the user whether to escalate the session to Standard Mode.
The agent MUST NOT continue generating code beyond this threshold without explicit human authorization.
