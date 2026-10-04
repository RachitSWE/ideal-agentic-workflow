# Task Reviewer Matrix

## 1. Introduction and Purpose
This document provides the authoritative mapping between task type tags assigned in `.agents/session-[SHA]/task.md` and the reviewer subagent personas to be spawned during the S8 Code Review phase.
By systematically matching the specialized persona to the architectural layer and stack touched by the task, review feedback remains laser-focused on layer-specific risks (e.g., security for backends, accessibility for frontends, tick rates for Minecraft mods, sequence allocation and lazy fetching for Hibernate).

---

## 2. Modal Persona Allocation Rules

The total count and selection of reviewer subagents depends on the active operating mode recorded in `mode.txt`:

| Operating Mode | Reviewer Count | Persona Selection Logic |
| :--- | :--- | :--- |
| **Trivial Mode** | **0** | S8 is skipped entirely. |
| **Fast Mode** | **1** | Always spawn 1 reviewer using `agents/fullstack-implementation-reviewer.md`. |
| **Standard Mode** | **2–3** | Spawn 1 `agents/fullstack-implementation-reviewer.md` + 1 domain/stack specialist from the matrix below (or 2 if `[fullstack]`). |
| **Duolithic Mode** | **3–4** | Output R-Agent prompt delegating review of `submit(N).md` with 3–4 specialized personas. |

---

## 3. Fullstack Web & Backend Reviewer Routing Matrix

When the detected project type in `context.md` is Web / Fullstack, map the task's type tag to these personas from `agents/`:

| Task Type Tag / Stack | Primary Reviewer (Required) | Secondary Specialist (Stack Specific) | Tertiary (If Fullstack / 3 Reviewers) | Focus Areas |
| :--- | :--- | :--- | :--- | :--- |
| `[frontend]` (Next.js) | `agents/fullstack-implementation-reviewer.md` | `agents/nextjs-turborepo-reviewer.md` | `agents/fullstack-uiux-cro-auditor.md` | RSC boundaries, Server Actions, accessibility, hydration errors, bundle size. |
| `[backend]` (Spring Boot) | `agents/fullstack-implementation-reviewer.md` | `agents/spring-boot-reviewer.md` | `agents/fullstack-security-reviewer.md` | Transaction boundaries, DTO mapping, SecurityFilterChain, @RestControllerAdvice. |
| `[backend]` (Python AI) | `agents/fullstack-implementation-reviewer.md` | `agents/python-ai-reviewer.md` | `agents/fullstack-security-reviewer.md` | Async event loop non-blocking, vector dimension parity, Pydantic v2, pinned deps. |
| `[backend]` (Rust) | `agents/fullstack-implementation-reviewer.md` | `agents/rust-systems-reviewer.md` | `agents/fullstack-architecture-auditor.md` | Tokio async hygiene, zero unwrap/expect, thiserror/anyhow, lock contention. |
| `[database]` (PostgreSQL + Hibernate + Flyway) | `agents/fullstack-implementation-reviewer.md` | `agents/postgres-hibernate-flyway-reviewer.md` | `agents/fullstack-security-reviewer.md` | Flyway immutability, `ddl-auto=validate`, `fetch=LAZY`, sequence generator, OSIV disabled. |
| `[database]` (PostgreSQL + Prisma) | `agents/fullstack-implementation-reviewer.md` | `agents/postgres-prisma-reviewer.md` | `agents/fullstack-security-reviewer.md` | Prisma N+1, over-fetching with include, migration immutability, `$transaction` atomicity. |
| `[database]` (MongoDB + Redis) | `agents/fullstack-implementation-reviewer.md` | `agents/mongo-redis-reviewer.md` | `agents/fullstack-security-reviewer.md` | NoSQL injection, mandatory Redis TTLs, keyspace namespacing, BSON 16MB boundary. |
| `[infra]` | `agents/fullstack-implementation-reviewer.md` | `agents/fullstack-security-reviewer.md` | `agents/fullstack-architecture-auditor.md` | Secret leakage, environment configuration, container safety, build reproducibility. |
| `[fullstack]` | `agents/fullstack-implementation-reviewer.md` | Stack-specific Reviewer (from above) | `agents/fullstack-security-reviewer.md` | End-to-end data flow, API contract compliance, error propagation, UI state synchrony. |

---

## 4. Minecraft Modding Reviewer Routing Matrix

When the detected project type in `context.md` is Minecraft (Fabric / NeoForge), map the task's type tag to these subagents from `agents/`:

| Task Type Tag / Mod Loader | Primary Reviewer (Required) | Secondary Specialist (Loader Specific) | Focus Areas |
| :--- | :--- | :--- | :--- |
| Fabric Mod (`mc-fabric`) | `agents/fullstack-implementation-reviewer.md` | `agents/mc-fabric-reviewer.md` | Client code bleed in common/server, `@Overwrite` mixins, 20 TPS tick rate, Blaze3D compliance. |
| NeoForge Mod (`mc-neoforge`) | `agents/fullstack-implementation-reviewer.md` | `agents/mc-neoforge-reviewer.md` | `DeferredRegister` mandate, MOD vs FORGE bus targeting, `Dist.CLIENT` isolation, mod ID parity. |
| Mod Performance (`[gameplay]`) | `agents/fullstack-implementation-reviewer.md` | `agents/mc-game-performance-auditor.md` | Tick rate efficiency (20 TPS), memory churn, entity tick loops, event handlers. |
| Mod Compatibility (`[compat]`) | `agents/fullstack-implementation-reviewer.md` | `agents/mc-mod-compatibility-auditor.md` | Mixin injection priority, conflict safety, registry collision prevention. |
| Mappings (`[mapping]`) | `agents/fullstack-implementation-reviewer.md` | `agents/mc-mapping-compliance-auditor.md` | Yarn / Mojang mapping correctness, intermediary names, version port safety. |

---

## 5. Reviewer Invocation Payload Structure

When invoking subagents via `invoke_subagent`, the prompt for each reviewer MUST include:
1. **Absolute path to `submit(n).md`** in `.agents/session-[SHA]/code-review/submit/`.
2. **The reviewer persona definition** loaded from the designated `agents/<persona>.md` file.
3. **The code review guide** loaded from `skills/s8-code-review/resources/code-review-guide.md`.
4. **The target output path**: `.agents/session-[SHA]/code-review/review/review(n).md`.
5. **Mandatory verdict schema**: Explicitly requiring either `LGTM` or `CHANGES_REQUESTED` with actionable file/line diff citations.
