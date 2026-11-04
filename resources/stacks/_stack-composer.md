# Stack Composer Protocol

## 1. Introduction and Purpose
This document defines the automated protocol for parsing a project's technology stack from `GEMINI.md` and composing the corresponding stack pack instructions into `.agents/session-[SHA]/context.md` during S1 Step 6.
Modern enterprise applications combine multiple specialized technologies (e.g. Next.js or Angular frontend with Spring Boot or FastAPI backend, paired with PostgreSQL, MongoDB, and Redis).
The Stack Composer allows the workflow to assemble a composite architectural profile so downstream stages (S2 Audit, S6 Coding, S7 Testing, S8 Code Review) load all relevant constraints, invariants, and reviewer matrices without ambiguity.

---

## 2. Detection and Mapping Procedure

### Step 1: Parse GEMINI.md §2.3
Inspect Section 2.3 (Technology Stack) of `GEMINI.md` in the project root. Extract all documented languages, frameworks, ORMs, and databases.

### Step 2: Match Against Canonical Stack Pack Registry
Scan the canonical subdirectories in `resources/stacks/` and match extracted technologies against the following pack registry:

#### A. Database Infrastructure (`resources/stacks/database/`)
| Technology Keywords | Applicable Stack Pack | Primary Domain |
| :--- | :--- | :--- |
| MongoDB, DocumentDB, Mongoose, BSON | `resources/stacks/database/mongodb.md` | Document Database |
| Redis, Upstash, In-Memory, Key-Value, Cache | `resources/stacks/database/redis.md` | Cache / KV / Rate Limiting |
| PostgreSQL, Postgres, Relational SQL, ACID | `resources/stacks/database/postgresql.md` | Relational Database |

#### B. Backend Subsystems (`resources/stacks/backend/`)
| Technology Keywords | Applicable Stack Pack | Primary Domain |
| :--- | :--- | :--- |
| Java, Spring Boot, Spring Security, Gradle, Maven | `resources/stacks/backend/backend-java.md` | Java Web Backend |
| Spring Data JPA, Hibernate, Flyway, Mongo, Redis | `resources/stacks/backend/java-databases.md` | Java ORM & Drivers |
| Python, FastAPI, Pydantic, Uvicorn, ASGI | `resources/stacks/backend/backend-python.md` | Python Backend / AI Service |
| SQLAlchemy, Asyncpg, Motor, Beanie, Alembic | `resources/stacks/backend/python-databases.md` | Python Async Databases |
| Rust, Axum, Tokio, Serde, Cargo | `resources/stacks/backend/backend-rust.md` | Systems / Rust Backend |
| SQLx, Tokio Postgres, Rust Redis, Rust MongoDB | `resources/stacks/backend/rust-databases.md` | Rust Database Drivers |

#### C. Frontend Subsystems (`resources/stacks/frontend/`)
| Technology Keywords | Applicable Stack Pack | Primary Domain |
| :--- | :--- | :--- |
| Next.js, React 19, App Router, RSC, Tailwind | `resources/stacks/frontend/nextjs.md` | React / Next.js App Router |
| Next.js Pages, Pages Router, _app.tsx, SSR | `resources/stacks/frontend/nextjs-pages.md` | Next.js Pages Router |
| Angular 18/19, Signals, Zoneless, Standalone | `resources/stacks/frontend/angular.md` | Angular Modern Frontend |

#### D. Minecraft Modding Subsystems (`resources/stacks/minecraft/`)
| Technology Keywords | Applicable Stack Pack | Primary Domain |
| :--- | :--- | :--- |
| Minecraft, Fabric, Fabric Loom, Yarn, Mixin | `resources/stacks/minecraft/mc-fabric.md` | Minecraft Fabric Modding |
| Minecraft, NeoForge, Forge, Parchment, ModDevGradle | `resources/stacks/minecraft/mc-forge.md` | Minecraft NeoForge / Forge |

### Step 3: Handle Unmatched Technologies
If a project uses a stack not present in the table above:
1. Note the unmatched technology in `context.md`.
2. Apply general Senior Developer invariants (AP-001 through AP-008).
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
- **Frontend Subsystem**: [e.g., Next.js 16 (App Router) or Angular 19]
- **Backend Subsystem**: [e.g., Spring Boot 3.3 (Java 21) or FastAPI (Python 3.12)]
- **Databases & Caches**: [e.g., PostgreSQL 16 + Redis 7.2 + MongoDB 7.0]

## 3. Active Stack Packs
- `resources/stacks/frontend/nextjs.md`
- `resources/stacks/backend/backend-java.md`
- `resources/stacks/backend/java-databases.md`
- `resources/stacks/database/postgresql.md`
- `resources/stacks/database/redis.md`

## 4. Auditor & Reviewer Category
- **Applicable Persona Bank**: `skills/s2-codebase-audit/resources/fullstack-persona-bank.md` (or `skills/s2-codebase-audit/resources/minecraft-persona-bank.md`)
```
