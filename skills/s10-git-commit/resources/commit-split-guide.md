# Commit Split Guide

## 1. Introduction and Purpose
This document provides the mandatory protocol for managing commits that exceed the 150-insertion sizing guideline during the S10 Git Commit phase.
In disciplined Agentic Engineering, commits must be **atomic**, **bisectable**, and **independently reviewable**.
Monolithic commits (> 150 insertions) hide regressions, degrade Git history readability, and make automated rollbacks dangerous.
Whenever the orchestrating agent measures a diff exceeding 150 insertions, reading and adhering to this guide is **strictly compulsory**.

---

## 2. Sizing Principles and Target Metrics

- **Target Insertion Budget**: ~50–150 insertions per commit.
- **Atomic Principle**: One commit represents exactly one logical change. Never split a single cohesive change across two commits if either commit leaves the codebase in a broken or non-compiling state.
- **Hard Prohibition**: `git add .` is strictly prohibited. Staging must always be performed on an explicit per-file basis (`git add <file>`).

---

## 3. The 150+ Insertion Decision Gate

When `commands/measure-diff.ps1` or `git diff --stat` indicates $> 150$ insertions, the agent MUST evaluate the following decision tree:

```text
               Total Insertions > 150?
                         │
                         ▼
        Is the change an indivisible atomic unit?
      (e.g., single cohesive component + unit tests,
      or database migration + schema + generated types)
            /                           \
          YES                            NO
          /                                \
  KEEP SINGLE COMMIT               SPLIT INTO MULTIPLE COMMITS
  (Mandatory Justification)        (Execute Splitting Protocol)
  Include 1 sentence in body:       Stage per-file into independent,
  "atomic: [reason why unified]"    compilable commits (< 150 LOC each)
```

---

## 4. When to Keep a Single Commit (> 150 Insertions)

You may keep the commit unified if splitting would break the build or leave intermediate states unusable:
- A new feature service coupled with its required unit test suite.
- A database schema migration alongside the generated ORM client/types.
- A large refactoring where all touched call sites must update concurrently.

**Mandatory Requirement**: The commit body MUST contain exactly one sentence explaining the atomic justification:
```text
feat(auth): implement jwt token rotation service

atomic: pairs token generation service with cryptographic verification tests and token blacklisting logic.
```

---

## 5. The Step-by-Step Splitting Protocol

If the change contains multiple logical responsibilities (e.g., adding a database model, adding a backend endpoint, AND modifying a frontend page), the agent MUST split the work into separate commits.

### Step 1: Group Files by Architectural Layer
Group changed files into logical batches:
1. **Batch 1 (Data / Schema)**: Prisma schema, SQL migrations, database entity definitions.
2. **Batch 2 (Core Logic / Services)**: Business logic services, repositories, utility functions.
3. **Batch 3 (API / Routing)**: API route handlers, controllers, middleware.
4. **Batch 4 (Frontend / Views)**: React components, styling, UI templates.
5. **Batch 5 (Tests)**: Test suites (if not committed alongside their specific service).

### Step 2: Stage and Verify Per Batch
For each batch:
1. Stage only the specific files for that batch:
   ```bash
   git add src/db/schema.prisma
   git add src/db/migrations/20261004_init/
   ```
2. Verify staged diff size:
   ```bash
   git diff --cached --stat
   ```
3. Commit using Conventional Commits format:
   ```bash
   git commit -m "feat(db): add user token schema and migrations" -m "defines refreshtoken table with foreign key indices."
   ```
4. Verify the codebase compiles/passes tests before moving to the next batch.

### Step 3: Repeat Until Git Working Tree is Clean
Iterate through remaining files until `git status` reports no untracked or modified files remaining for the task.
