---
name: s8-code-review
description: "Orchestrates the rigorous peer review phase, strictly gating progression based on automated test results and multi-agent consensus."
---

# S8 Code Review

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S8 Code Review phase within the `ideal-agentic-workflow` plugin. 
The S8 phase is the uncompromising quality gate designed to prevent untested, flawed, or architecturally unsound code from progressing to the commit stage.
The orchestrating agent MUST execute the protocols defined below to guarantee that the peer review process remains objective, thorough, and completely isolated from the authoring context.
Bypassing this phase or manipulating the review outcomes violates the core tenets of the workflow and completely invalidates the integrity of the generated codebase.
This rigorous approach mimics a real-world engineering team where peer consensus is an absolute prerequisite for merging.

---

## 2. Mandatory Files to Read at this Step

Before and during execution of S8, the agent MUST explicitly read:
1. **Routing Matrix & Review Guidelines**:
   - `skills/s8-code-review/resources/task-reviewer-matrix.md` (Authoritative mapping between task type tags and reviewer subagents)
   - `skills/s8-code-review/resources/code-review-guide.md` (Checklist, anti-pattern detection rules, and verdict guidelines)
2. **Submission & Review Templates**:
   - `resources/submit-template.md` (Schema for authoring `.agents/session-[SHA]/code-review/submit/submit(N).md`)
   - `resources/review-template.md` (Schema for reviewer outputs in `.agents/session-[SHA]/code-review/review/review(N).md`)
3. **Primary Implementation Reviewer**:
   - `agents/fullstack-implementation-reviewer.md` (or `agents/fullstack/implementation-reviewer.md`) (Primary reviewer for all code changes, evaluating AP-001 through AP-004)
4. **Dedicated Stack-Specific Reviewer Subagents** (Select and read based on the active task and stack):
   - **PostgreSQL + Hibernate + Flyway**:
     - `agents/postgres-hibernate-flyway-reviewer.md` (Auto-DDL ban, lazy fetching, sequence IDs, Flyway immutability, OSIV)
   - **Next.js & Turborepo**:
     - `agents/nextjs-turborepo-reviewer.md` (RSC boundaries, Server Actions, client bundle size, static params)
   - **Java Spring Boot**:
     - `agents/spring-boot-reviewer.md` (Service transaction boundaries, DTO mapping, SecurityFilterChain, RFC 7807)
   - **Python AI & RAG Backend**:
     - `agents/python-ai-reviewer.md` (Async event loop hygiene, vector dimensions, Pydantic v2, pinned dependencies)
   - **Rust Systems & Backend**:
     - `agents/rust-systems-reviewer.md` (Tokio async hygiene, zero unwrap/expect in prod, thiserror/anyhow, lock contention)
   - **PostgreSQL + Prisma**:
     - `agents/postgres-prisma-reviewer.md` (Prisma N+1 queries, over-fetching with include, migration immutability, transactions)
   - **MongoDB + Redis**:
     - `agents/mongo-redis-reviewer.md` (NoSQL injection defense, mandatory Redis TTLs, keyspace namespacing, BSON bounds)
   - **Minecraft Fabric Modding**:
     - `agents/mc-fabric-reviewer.md` (or `agents/minecraft/implementation-reviewer.md`) (Client code bleed in server, zero `@Overwrite` mixins, 20 TPS, Blaze3D)
   - **Minecraft NeoForge Modding**:
     - `agents/mc-neoforge-reviewer.md` (DeferredRegister mandate, MOD vs FORGE bus targeting, `Dist.CLIENT` isolation)
   - **Security Reviewer**:
     - `agents/fullstack-security-reviewer.md` (or `agents/fullstack/security-code-reviewer.md`) (Auth boundaries, token verification, secret leakage, injection defense)

---

## 3. Hard Gating and Behavioral Rules
The integrity of the review process relies entirely on strict adherence to the project's foundational behavioral constraints:
- **Pre-Review Test Gate**: "NEVER invoke S8 code review if any automated test is failing."
- **Zero Self-Review Invariant**: "NEVER write a review file yourself. Review MUST come from real subagents or R-Agent."
- **Zero Mock Reviews**: Fake reviews or simulated approvals constitute a critical workflow failure.

---

## 4. Review Execution Protocol

### 4.1 Submit File Creation Protocol
Before spawning reviewers, the agent MUST formally document the task changes by creating:
`.agents/session-[SHA]/code-review/submit/submit(N).md`
Using the schema from `resources/submit-template.md`:
- Task description and requirements from `task.md`.
- Explicit list of all files created or modified.
- Surgical git diff of the changes (measured via `commands/measure-diff.ps1`).
- Specific verification questions for the reviewer subagents.

### 4.2 Modal Reviewer Invocation
Read `skills/s8-code-review/resources/task-reviewer-matrix.md` and spawn the appropriate reviewers:
- **Fast Mode**: Spawn exactly 1 reviewer: `agents/fullstack-implementation-reviewer.md`.
- **Standard Mode**: Spawn 2 to 3 reviewers:
  - 1 `agents/fullstack-implementation-reviewer.md` (Required)
  - 1 Stack-Specific Reviewer (e.g. `agents/postgres-hibernate-flyway-reviewer.md`, `agents/nextjs-turborepo-reviewer.md`, etc.)
  - 1 Domain/Security Specialist if task tag is `[fullstack]` or `[security]` (e.g. `agents/fullstack-security-reviewer.md`)
- **Duolithic Mode**: Output R-Agent prompt delegating review of `submit(N).md` with 3–4 specialized reviewers. Wait for `RAGENT_DONE`.
- **Trivial Mode**: S8 is skipped entirely.

### 4.3 Subagent Invocation Payload
When calling `invoke_subagent`, the prompt payload for each reviewer MUST include:
1. Absolute path to `submit(N).md`.
2. The specific reviewer persona file content loaded from `agents/<reviewer-name>.md`.
3. The review guide loaded from `skills/s8-code-review/resources/code-review-guide.md`.
4. The output path: `.agents/session-[SHA]/code-review/review/review(N).md`.
5. Mandatory verdict schema: `LGTM` or `CHANGES_REQUESTED`.

---

## 5. Progression Gate & Iteration Loops
Upon receiving all `review(n).md` files:
- **Consensus Requirement**: "LGTM from ALL reviewers required before proceeding. A single CHANGES_REQUESTED blocks advancement."
- **If CHANGES_REQUESTED**:
  - Enter S9 Bug Fix phase immediately.
  - Remediate all issues in code.
  - Re-run targeted S7 Automated Testing until 100% pass.
  - Create `submit(N+1).md` with fix changelog and re-invoke reviewers until unanimous approval.
- **If Unanimous LGTM**:
  - Mark active task as `[x]` in `.agents/session-[SHA]/task.md`.
  - If incomplete tasks remain: Loop back to S6 Coding for the next task.
  - If all tasks are completed (`[x]`): Proceed directly to S10 Git Commit.
