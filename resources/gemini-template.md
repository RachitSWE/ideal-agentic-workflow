# PRD: [Project Name]
### Author: [Author Name] · [Author URL] · Version 1.0.0

> **This document is the single source of truth for the project.**
> Nothing gets built that isn't in this document. Nothing in this document gets skipped.

---

## Table of Contents

The following table of contents provides quick navigation to the core sections of the PRD.
The agent MUST use this to quickly locate specific constraints.

1. [Project Identity & Philosophy](#1-project-identity--philosophy)
2. [Workflow Architecture](#2-workflow-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Directory Structure](#4-directory-structure)
5. [Open Features](#5-open-features)
6. [Anti-Patterns](#6-anti-patterns)

---

## 1. Project Identity & Philosophy

[Provide the high-level goal of the project and its core philosophy. e.g. "A highly performant Rust web backend..."]

---

## 2. Workflow Architecture

[Define the major components, modules, or services and how they interact.]

---

## 3. Technology Stack

[List the specific technologies used. The agent will use this to load Stack Reference Packs.]
[The agent MUST strictly adhere to the listed tools and frameworks.]
- **Frontend**: [e.g., Next.js 14, TailwindCSS]
- **Backend**: [e.g., Spring Boot 3.2, Java 21]
- **Database**: [e.g., PostgreSQL 16, Prisma ORM]

---

## 4. Directory Structure

[List the non-gitignored source directories and their responsibilities. The auditor uses this to scope the codebase.]
[This section is inviolable — never shorten it during S11 updates.]
```text
src/
├── main/
│   ├── java/        ← Application logic
│   └── resources/   ← Configuration
└── test/            ← Test suite
```
[The directories listed above represent the exhaustive scope of the application logic. The agent MUST NOT modify files outside of these directories.]

---

## 5. Open Features

[List the tracked features and bugs. The agent will read this during planning.]
[The agent MUST NOT work on features that are not explicitly listed below.]
- [ ] Feature 1: Implement user authentication.
- [ ] Bug 1: Fix broken layout on mobile devices.

---

## 6. Anti-Patterns

[List specific coding patterns that are forbidden in this project.]
[The CI/CD Peer Review pipeline MUST reject any code containing these patterns.]
- Do not use `any` in TypeScript.
- Do not commit uncommented magic numbers.
