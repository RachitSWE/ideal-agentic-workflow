---
name: s0-repo-architect
description: Establishes an authoritative GEMINI.md PRD baseline for greenfield or brownfield repositories before initiating S1 Orchestrator, executing exhaustive discovery, stack pinning, max-depth ASCII directory mapping, and schema certification.
---

# S0 Repository Production Architect

## 1. Overview & System Purpose

This skill establishes the deterministic protocol for transforming any existing codebase or greenfield project into an authoritative, production-verified repository. It enforces the compilation of a rigorous, non-drifting Single Source of Truth document—standardized as `GEMINI.md`—which governs all downstream architectural planning, agentic workflows, and CI/CD quality gates.

Modern software engineering suffers when AI agents hallucinate dependencies, misidentify project architecture, truncate directory trees, or rely on outdated memory. By executing an exhaustive, automated audit and applying standardized verification schemas, this skill produces an immutable architectural baseline that guarantees complete alignment between written specifications and physical source code.

---

## 2. When to Use & Triggering Conditions

The procedures defined in this skill are activated whenever an engineering session requires establishing or certifying the repository's foundational architecture. Applying this skill early prevents architectural drift and ensures all future coding iterations have verified constraints.

### 2.1 Triggering Scenarios
The agent MUST invoke this skill when any of the following conditions occur:
- Initializing a greenfield codebase that lacks an authoritative `GEMINI.md` single source of truth.
- Onboarding onto a brownfield or inherited codebase where documentation is missing, fragmented, or outdated.
- Detecting architectural hallucinations where documented tools (e.g., databases, frameworks) do not match actual repository files.
- Refactoring repository documentation to meet strict enterprise CI/CD verification gates.
- Generating a complete, max-depth ASCII directory tree with one-line file explainers for codebase navigation.

### 2.2 When NOT to Use
The agent MUST NOT invoke this skill in the following scenarios:
- Executing minor feature implementations or bug fixes within an already certified repository (use `s6-coding` instead).
- Writing one-off scratch scripts or temporary test cases that do not alter the persistent architecture.
- Documenting temporary session notes or intermediate brainstorming artifacts (store in `.agents/session-SHA/` instead).

---

## 3. Mandatory Files to Read at this Step

Before and during execution of S0, the agent MUST explicitly read:
1. **Schema Specifications & Templates**:
   - `skills/s0-repo-architect/schemas/gemini-prd-schema.json` (The canonical JSON schema governing GEMINI.md structure)
   - `skills/s0-repo-architect/schemas/anti-pattern-schema.json` (Schema defining mandatory anti-pattern format)
   - `skills/s0-repo-architect/templates/gemini-production-template.md` (Production PRD layout template)
   - `skills/s0-repo-architect/templates/directory-tree-explainer-template.txt` (Guidelines for directory tree explainers)
   - `resources/gemini-template.md` (Standard baseline GEMINI.md reference template)
2. **Automated Verification Scripts**:
   - `skills/s0-repo-architect/scripts/generate-ascii-tree.js` (Automated ASCII directory tree generator)
   - `skills/s0-repo-architect/scripts/verify-gemini-schema.js` (Automated 6/6 section validator)

---

## 4. The 6-Stage Compilation Lifecycle

The process of constructing an authoritative repository baseline follows a six-stage sequential pipeline. Each stage enforces explicit pre-conditions, concrete execution steps, and verifiable post-conditions that eliminate ambiguity.

```
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 1: Exhaustive Codebase Discovery                   │
│   (git ls-files -> Read every tracked file -> Zero Subagents)          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 2: Technology Stack Verification                   │
│   (Inspect manifests -> Eliminate hallucinated tools -> Pin versions)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 3: Max-Depth ASCII Directory Synthesis             │
│   (generate-ascii-tree.js -> ASCII branches -> 1-Line Explainers)      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 4: Workflow Architecture & Identity Definition     │
│   (Synthesize 4-tier clearings, gateways, protocols & core invariants) │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 5: Project-Specific Anti-Pattern Formulation       │
│   (Derive 10-12 critical anti-patterns: Violation, Consequence, Rule)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               STAGE 6: Production Verification & Schema Certification  │
│   (verify-gemini-schema.js -> Pass 6/6 Mandatory Sections)             │
└────────────────────────────────────────────────────────────────────────┘
```

### Stage 1: Exhaustive Codebase Discovery
Before any documentation is written, the agent MUST understand the complete physical reality of the codebase. Guessing repository contents or relying on shallow directory listings causes immediate architectural failure.

1. **Inventory Collection**: The agent MUST run `git ls-files` from the repository root to obtain an exhaustive array of all tracked files.
2. **Direct Source Inspection**: The agent MUST directly view and inspect all tracked files across the codebase. The agent MUST NOT delegate this initial inventory to subagents, ensuring direct contextual mastery.
3. **Artifact Boundary Identification**: The agent MUST inspect `.gitignore` to distinguish persistent project files from ephemeral build targets (`node_modules/`, `target/`, `.next/`, `dist/`).

### Stage 2: Technology Stack Verification & Anti-Hallucination
Documentation frequently contains legacy claims about frameworks or databases that do not exist in the code. Stage 2 eliminates all architectural hallucinations.

1. **Manifest Inspection**: The agent MUST parse root package manifests (`package.json`, `pom.xml`, `build.gradle`, `Cargo.toml`, `go.mod`, `requirements.txt`).
2. **Runtime Pinning**: The agent MUST record exact runtime SDKs and framework major/minor versions (e.g., `Java 21 LTS`, `Spring Boot 3.2.4`, `Next.js 16.3.0`, `React 19.2.8`).
3. **Ghost Dependency Removal**: If documentation references a database or tool (e.g., MongoDB) that has zero supporting configuration, driver dependencies, or container services in the repository, the agent MUST explicitly eradicate it from the tech stack.

### Stage 3: Max-Depth ASCII Directory Synthesis
The repository directory structure provides the spatial map used by all future agents to locate logic. Truncated or abbreviated directory trees are strictly prohibited.

1. **Script Execution**: The agent MUST execute the automated generator script [`scripts/generate-ascii-tree.js`](./scripts/generate-ascii-tree.js).
2. **ASCII Branch Compliance**: The generated tree MUST utilize standard ASCII branch characters (`|-- `, `\-- `, `|   `, `    `). Unicode box-drawing characters (`├──`, `└──`) MUST NOT be used to prevent cross-platform encoding corruption in terminal environments.
3. **Aligned One-Line Explainers**: Every directory and file entry in the tree MUST be annotated with an aligned `← Explainer` explaining its exact architectural responsibility.

### Stage 4: Workflow Architecture & Identity Definition
Section 1 and Section 2 of `GEMINI.md` establish the purpose and operational mechanics of the system.

1. **Project Identity (#1)**: Define the high-level mission, core target users, operational philosophy, and non-negotiable architectural principles.
2. **Workflow Architecture (#2)**: Detail the multi-phase lifecycle of the system. Document identity assertion, gateway connections, caching layers, data serialization, and communication protocols.

### Stage 5: Project-Specific Anti-Pattern Formulation
Generic rules like "write clean code" provide zero defensive value. Section 6 MUST formulate 10 to 12 highly critical anti-patterns derived specifically from the project's unique domain.

1. **Domain Relevance**: Every anti-pattern MUST target a concrete failure mode within the application's actual stack and architecture.
2. **Three-Part Anatomy**: Every anti-pattern MUST strictly contain three explicit clauses:
   - **Violation**: The exact prohibited action, bad practice, or protocol deviation.
   - **Consequence**: The direct failure mode, security breach, rate-limit penalty, or data corruption.
   - **Mitigation**: The mandatory architectural rule or code pattern required to prevent the violation.

### Stage 6: Production Verification & Schema Certification
The generated PRD MUST be programmatically verified against the canonical schema.

1. **Verification Command**: The agent MUST execute [`scripts/verify-gemini-schema.js`](./scripts/verify-gemini-schema.js).
2. **Zero Error Acceptance**: The script MUST output `[STATUS] Verification PASSED` with all 6 mandatory sections validated before the repository baseline is certified.

---

## 4. The Canonical GEMINI.md Specification Matrix

The following reference table defines the six mandatory sections required in every production-certified `GEMINI.md` document. The agent MUST NOT alter section numbers, rename section headers, or omit any section.

| Section ID | Canonical Section Header | Required Contents & Invariants | Verification Rule |
|---|---|---|---|
| **# 1** | `## 1. Project Identity & Philosophy` | High-level mission, target audience, core operational principles | Minimum 3 architectural principles |
| **# 2** | `## 2. Workflow Architecture` | End-to-end dataflows, auth phases, gateway sync, caching logic | Multi-phase step-by-step descriptions |
| **# 3** | `## 3. Technology Stack` | Verified frontend, backend, database, and protocol versions | Zero unverified/ghost dependencies |
| **# 4** | `## 4. Directory Structure` | Max-depth ASCII tree (`|-- `, `\-- `) with aligned explainers | $\ge 80\%$ lines contain `← Explainer` |
| **# 5** | `## 5. Open Features` | Tracked pending features, active bug tickets, or clear backlog | Fenced backlog state |
| **# 6** | `## 6. Anti-Patterns` | 10–12 project-specific critical anti-patterns | Violation, Consequence, Mitigation defined |

---

## 5. Script & Tooling Execution Guide

This skill provides automated Node.js tooling designed to guarantee hermetic, reproducible compilation of repository baselines. The agent MUST utilize these scripts rather than attempting manual ASCII drawing.

### 5.1 Generating the Max-Depth ASCII Tree
To generate the full ASCII directory tree with aligned one-line explainers, run the provided script from the command line:

```bash
node "skills/s0-repo-architect/scripts/generate-ascii-tree.js" \
  --cwd "<path-to-repository-root>" \
  --output "<path-to-output-txt>" \
  --explainers "<path-to-explainers-json>" \
  --align 42
```
*Expected Output*: A deterministically ordered, complete ASCII tree covering 100% of tracked files, with every entry padded to column 42 followed by `← [Explainer]`.

### 5.2 Verifying GEMINI.md Schema Conformance
To verify that the generated `GEMINI.md` satisfies all production certification requirements, execute the verification script:

```bash
node "skills/s0-repo-architect/scripts/verify-gemini-schema.js" \
  --file "<path-to-repository-root>/GEMINI.md"
```
*Expected Output*:
```text
[VERIFY] Validating GEMINI.md: .../GEMINI.md

--- VERIFICATION REPORT ---
File Exists: PASS
Mandatory Sections:
  - Project Identity & Philosophy: PASS
  - Workflow Architecture: PASS
  - Technology Stack: PASS
  - Directory Structure: PASS
  - Open Features: PASS
  - Anti-Patterns: PASS
Table of Contents: PASS
Directory Tree Lines: 266 (PASS)
Anti-Patterns Count: 12 (Target: >= 10) - PASS
Anti-Patterns Structured: PASS

[STATUS] Verification PASSED. GEMINI.md meets production certification standards.
```

---

## 6. Critical Anti-Pattern Anatomy Standards

Every anti-pattern documented in Section 6 of `GEMINI.md` MUST comply with the schema defined in [`schemas/anti-pattern-schema.json`](file:///C:/Users/HP/.gemini/config/plugins/ai-plugin/skills/repo-production-architect/schemas/anti-pattern-schema.json). Generic workflow complaints are strictly forbidden.

### 6.1 Required Clause Definitions
Each anti-pattern entry MUST define three structured sub-clauses:
- **Violation Clause**: Concrete description of the exact code construct, configuration mistake, or protocol deviation that must never be committed.
- **Consequence Clause**: The exact technical failure mode that results if the violation occurs (e.g., HTTP 400 Bad Request, 429 IP ban, memory leak, security privilege escalation).
- **Mitigation Clause**: The unambiguous, actionable engineering rule, utility function, or architectural guard that developers and agents must implement instead.

### 6.2 Compliant Anti-Pattern Example
The code block below demonstrates an authentic, compliant project-specific anti-pattern entry:

```markdown
1. **Raw Hexadecimal / Decimal Desynchronization in Type 17 Containers**
   - *Violation*: Transmitting raw hex color strings (e.g., `"#5865F2"`) in the `accent_color` attribute of Container components (Type 17) to the backend or Discord REST API.
   - *Consequence*: Discord API requires `accent_color` to be an integer decimal representation (e.g., `5793266`). Transmitting hex strings causes immediate JSON validation failure (`INVALID_INTEGER`), while unvalidated integer conversions risk numerical overflow or negative values.
   - *Mitigation*: Color transformations must consistently pass through `hexToDecimal` and `decimalToHex` utilities with a verified fallback default (`#5865F2` / `5793266`).
```
*Notice how this entry isolates the exact technical parameter, names the specific HTTP failure code, and prescribes the exact utility function required.*

---

## 7. Common Failure Modes & Prohibited Practices

The following table catalogs common failure modes encountered during repository baseline compilation. The agent MUST recognize and avoid these anti-patterns.

| Prohibited Failure Mode | Root Cause | Observable Symptom | Corrective Action |
|---|---|---|---|
| **Vibe Inventorying** | Assuming file structure without checking `git ls-files` | Document references non-existent files or misses core modules | Run `git ls-files` and view every single source file directly |
| **Ghost Stack Hallucination** | Copying legacy documentation blindly | Tech stack lists databases or tools with zero code presence | Verify against `pom.xml`, `package.json`, and Docker manifests |
| **Abbreviated Directory Tree** | Manually writing a 15-line tree with `...` placeholders | Future agents lack file paths and create duplicate files | Run `generate-ascii-tree.js` to render 100% of tracked files |
| **Missing Tree Explainers** | Pasting bare directory paths without annotations | Reader cannot infer module responsibilities without opening files | Append `← Explainer` annotations aligned to column 42 |
| **Generic Anti-Patterns** | Writing generic rules like "don't use any in TS" | Offers zero domain-specific protection for complex architectures | Formulate 10–12 anti-patterns specific to project APIs and schemas |
| **Renaming Section Headers** | Changing section titles or altering section numbers | Breaks automated workflow tools and CI sync parsers | Preserve exact canonical H2 titles 1 through 6 |

---

## 8. Verification & Acceptance Criteria

Before concluding any session that establishes or updates a repository baseline, the agent MUST confirm compliance against all items in this checklist:

1. **Existence**: `GEMINI.md` exists directly in the repository root directory.
2. **Canonical Headers**: All 6 mandatory H2 section headers are present with exact numbering and naming.
3. **Table of Contents**: Exactly 6 anchored table of contents links point to the 6 sections.
4. **Verified Tech Stack**: All listed frameworks, runtimes, and databases correspond to verified dependencies in source manifests.
5. **Max-Depth Directory Tree**: Section 4 contains a complete ASCII tree generated via `git ls-files` with $\ge 80\%$ of lines annotated with aligned `← Explainer` strings.
6. **Anti-Pattern Count & Structure**: Section 6 contains between 10 and 15 project-specific anti-patterns, each with explicit *Violation*, *Consequence*, and *Mitigation* entries.
7. **Automated Gate Success**: Executing `node verify-gemini-schema.js --file <path>` returns exit code `0` with `[STATUS] Verification PASSED`.
