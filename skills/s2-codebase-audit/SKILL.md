---
name: s2-codebase-audit
description: "Executes the comprehensive multi-agent codebase audit based on repository size, ensuring all architectural and domain constraints are checked."
---

# S2 Codebase Audit

## 1. Introduction and Purpose
This document defines the strict execution protocol for the S2 Codebase Audit phase within the `ideal-agentic-workflow` plugin. 
The audit phase operates as a mandatory gatekeeper that prevents architectural degradation, hidden technical debt, and security vulnerabilities from compounding over time. 
The agent MUST follow the protocols defined below to correctly measure project scale, spawn concurrent specialized auditor subagents, and synthesize findings into an authoritative `audit.md`.

---

## 2. Mandatory Files to Read at this Step

Before and during execution of S2, the agent MUST explicitly read:
1. **Primary Project Specification**:
   - `GEMINI.md` (Read in full to establish baseline architectural constraints and directory tree)
2. **Audit Schema & Guidelines**:
   - `resources/audit-template.md` (Mandatory schema for all `audit(n).md` outputs and final `audit.md`)
   - `skills/s2-codebase-audit/resources/audit-compiler.md` (Directives for synthesizing multi-agent findings)
   - `skills/s2-codebase-audit/resources/fullstack-persona-bank.md` (Fullstack web persona definitions)
   - `skills/s2-codebase-audit/resources/minecraft-persona-bank.md` (Minecraft modding persona definitions)
3. **Auditor Subagent Definitions** (Select and read based on detected stack and tier):
   - **Fullstack Web & General Architecture**:
     - `agents/fullstack-architecture-auditor.md` (or `agents/fullstack/architecture-auditor.md`) (Module boundaries, decoupling, circular imports)
     - `agents/fullstack-security-reviewer.md` (or `agents/fullstack/security-auditor.md`) (Auth, input sanitization, OWASP vulnerabilities)
     - `agents/fullstack-performance-seo-auditor.md` (or `agents/fullstack/performance-seo-auditor.md`) (Core Web Vitals, SSR/SSG rendering, bundle size)
     - `agents/fullstack-uiux-cro-auditor.md` (or `agents/fullstack/uiux-cro-auditor.md`) (WCAG 2.1 AA accessibility, UX patterns)
     - `agents/fullstack-test-quality-auditor.md` (or `agents/fullstack/test-quality-auditor.md`) (Test coverage gaps, assertion quality, flakiness)
   - **PostgreSQL + Hibernate + Flyway**:
     - `agents/postgres-hibernate-flyway-auditor.md` (Flyway migration checksums, lazy fetching, sequences, OSIV)
   - **Minecraft Modding**:
     - `agents/mc-game-performance-auditor.md` (or `agents/minecraft/game-performance-auditor.md`) (20 TPS tick rate, entity tick loops, memory leaks)
     - `agents/mc-mapping-compliance-auditor.md` (or `agents/minecraft/mapping-compliance-auditor.md`) (Yarn / Mojang symbol parity, version porting)
     - `agents/mc-mod-compatibility-auditor.md` (or `agents/minecraft/mod-compatibility-auditor.md`) (Mixin injection conflicts, registry collisions)
   - **Audit Compilation & Persona Scaffolding**:
     - `agents/audit-compiler.md` (Merges distributed auditor outputs into master `audit.md`)
     - `agents/_persona-creator.md` (Scaffolds custom auditor personas for unmapped stacks)

---

## 3. Fast Mode and Trivial Protocol Bypasses
The agent MUST evaluate the current operating mode from `.agents/session-[SHA]/mode.txt` before expending quota on a full audit:
- **Session Skip List**: If the user's session skip list explicitly contains "S2" (or if `audit.md` exists and is $\le 7$ days old and skip is requested), skip S2 entirely and proceed to S3 Planning.
- **Trivial Protocol**: If the session mode is `/trivial`, skip S2 entirely.
- **Fast Mode**: If the session mode is `/fast mode`, check the age of `.agents/session-[SHA]/audit/audit.md` (or the most recent audit file):
  - If `audit.md` exists and is $\le 7$ days old: Skip S2 entirely.
  - If `audit.md` does not exist or is $> 7$ days old: Execute S2, but artificially cap resources at **Tier 1 (Small)** (2 auditors).

---

## 4. Adaptive Auditor Count and Sizing Logic
The agent MUST measure the repository size to determine the exact tier of auditing required:
1. **File Count**: Total non-gitignored source files listed in `GEMINI.md` Section 4.
2. **LOC Estimate**: Scan `GEMINI.md` file list and spot-check 5 representative files.

### Tier Assignment Matrix
- **Tier 1 (Small)**: `file_count <= 10` OR `loc_estimate <= 800` → Spawn **2 auditors**.
- **Tier 2 (Medium)**: `file_count <= 40` OR `loc_estimate <= 4000` → Spawn **4 auditors**.
- **Tier 3 (Large)**: `file_count > 40` OR `loc_estimate > 4000` → Spawn **5 auditors**.

---

## 5. Subagent Spawning Protocol

### Simultaneous Invocation
The agent MUST spawn all selected auditors simultaneously via a single `invoke_subagent` tool call. Sequential spawning is prohibited.
The prompt payload for each auditor subagent MUST explicitly include:
1. Absolute path to project root.
2. Absolute path to `GEMINI.md`.
3. The exact subagent persona file content loaded from `agents/<auditor-name>.md`.
4. Path to `resources/audit-template.md`.
5. Exact output file path: `.agents/session-[SHA]/audit/bin/audit(N).md`.

### Duolithic Mode Handling
If operating in `/duolithic mode`:
- Force tier to **Tier 3 (Large)**.
- Generate the R-Agent Onboarding Prompt instructing R-Agent to spawn 5 auditor subagents.
- Explicitly pause execution and wait for the `RAGENT_DONE` signal from the user.

---

## 6. Audit Compilation & Verification Gate
1. **Validate Raw Outputs**: Verify every spawned auditor wrote a valid `.agents/session-[SHA]/audit/bin/audit(n).md`. If any auditor returned an empty or superficial report, re-prompt it to inspect stack anti-patterns.
2. **Invoke Compiler Subagent**: Spawn `agents/audit-compiler.md` (reading `skills/s2-codebase-audit/resources/audit-compiler.md`) to:
   - Deduplicate overlapping findings across auditor reports.
   - Sort issues strictly by severity: `CRITICAL` > `HIGH` > `MEDIUM` > `LOW`.
   - Group findings by module and write the unified `.agents/session-[SHA]/audit.md`.
3. **Tick Checklist**: Mark S2 complete in `.agents/session-[SHA]/CHECKLIST.md`. Advance to S3 Planning.
