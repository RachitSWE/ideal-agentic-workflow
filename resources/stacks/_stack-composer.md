# Stack Composer Protocol

## 1. Introduction and Purpose
This document defines the automated protocol for parsing a project's technology stack from `GEMINI.md` and composing the corresponding stack pack instructions into `.agents/session-[SHA]/context.md` during S1 Step 6.
Modern applications frequently combine multiple technologies (e.g., Next.js frontend with Prisma and PostgreSQL, or a Python AI service with Redis).
The Stack Composer allows the workflow to assemble a composite architectural profile so downstream stages (S2, S6, S7, S8) load all relevant constraints without ambiguity.

---

## 2. Detection and Mapping Procedure

### Step 1: Parse GEMINI.md §2.3
Inspect Section 2.3 (Technology Stack) of `GEMINI.md` in the project root. Extract all documented languages, frameworks, ORMs, and databases.

### Step 2: Match Against Available Stack Packs
Scan the `resources/stacks/` directory and match the extracted technologies against the following pack registry:

| Technology Keywords | Applicable Stack Pack | Primary Domain |
| :--- | :--- | :--- |
| Next.js, React, Turborepo, TypeScript, Tailwind | `web-nextjs-turborepo.md` | Web Frontend / Fullstack |
| Java, Spring Boot, Spring Security, Gradle, Maven | `web-backend-java-spring.md` | Web Backend |
| Python, FastAPI, Django, Flask, PyTorch, LangChain | `web-backend-python-ai.md` | Web Backend / AI Service |
| Rust, Axum, Actix, Tokio, Serde, Cargo | `web-backend-rust.md` | Systems / Backend |
| PostgreSQL, Prisma, SQL | `database-postgres-prisma.md` | Relational Database |
| PostgreSQL, Hibernate, Flyway, JPA, Spring Data | `database-postgres-hibernate-flyway.md` | Enterprise Relational Database |
| MongoDB, Redis, Mongoose, Caching | `database-mongo-redis.md` | NoSQL / Cache |
| Minecraft, Fabric, Loom, Yarn, Mixin | `mc-fabric.md` | Minecraft Modding |
| Minecraft, NeoForge, Parchment, ModDevGradle | `mc-neoforge.md` | Minecraft Modding |

### Step 3: Handle Unmatched Technologies
If a project uses a stack not present in the table above:
1. Note the unmatched technology in `context.md`.
2. Apply general Senior Developer invariants (AP-001 through AP-004).
3. In S11, prompt the user if they would like to generate a new stack pack using `resources/stacks/_stack-pack-creator.md`.

---

## 3. Formatting and Persisting `context.md`

Once matched, write the composite stack configuration directly to `.agents/session-[SHA]/context.md` using the following schema:

```markdown
# Session Context

## 1. Project Profile
- **Session SHA**: [SHA]
- **Operating Mode**: [standard | fast | trivial | duolithic]
- **Date**: [YYYY-MM-DD]

## 2. Detected Tech Stack
- **Primary Framework**: [e.g., Next.js 15 (App Router)]
- **Database / Cache**: [e.g., PostgreSQL + Prisma]
- **Language**: [e.g., TypeScript 5.5]

## 3. Active Stack Packs
- `resources/stacks/web-nextjs-turborepo.md`
- `resources/stacks/database-postgres-prisma.md`

## 4. Auditor & Reviewer Category
- **Applicable Persona Bank**: `skills/s2-codebase-audit/resources/fullstack-persona-bank.md` (or `skills/s2-codebase-audit/resources/minecraft-persona-bank.md`)
```
