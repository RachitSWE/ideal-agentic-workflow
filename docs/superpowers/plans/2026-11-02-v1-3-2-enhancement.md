# Ideal Agentic Workflow v1.3.2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate ideal-agentic-workflow to v1.3.2 with dedicated Angular subagents, drop-in runtime smoke test templates (S7-B), GitHub Actions CI/CD automation, quickstart session CLI tooling, and active environment synchronization.

**Architecture:** Implement first-class Angular personas for both coding and code review; provide copy-pasteable, zero-mock runtime smoke scaffolds for Spring Boot, FastAPI, Next.js, Rust Axum, and Angular to eliminate boot-time crashes; add automated citation verification in GitHub Actions; provide a one-shot PowerShell session initializer; and synchronize the active plugin cache.

**Tech Stack:** Node.js (verification scripts), TypeScript/JavaScript (Next.js/Angular), Java 21/25 (Spring Boot), Python 3.12+ (FastAPI), Rust 1.82+ (Axum), PowerShell 7+, GitHub Actions CI.

**Spec:** User directive for Priorities 1 through 5, versioned as v1.3.2.

## Global Constraints

- **Plugin Version**: Bump all metadata and entrypoint occurrences to `1.3.2`.
- **Zero Broken Citations**: `node scripts/verify-file-citations.js` MUST pass with 100% success (0 broken links).
- **Conventional Commits**: Commit messages must follow `<type>(<scope>): <subject>` with lowercase body <= 150 chars.
- **Strict Invariants**: All created code and templates must adhere to October 2026 LTS standards and AGENTS.md rules.

## Review Focus

1. Ensure new Angular subagents are properly mapped in `skills/s8-code-review/resources/task-reviewer-matrix.md`.
2. Ensure smoke test templates contain real socket/health checks, not simulated mocks.
3. Ensure `.github/workflows/verify-workflow.yml` uses valid GitHub Actions schema and correct path triggers.
4. Ensure `scripts/start-session.ps1` handles path spaces, git repo checks, and creates all canonical `.agents/` session subdirectories.
5. Ensure synchronization to `C:\Users\HP\.gemini\config\plugins\plugin 1.2.0` preserves directory integrity without residual legacy files.

---

### Task 1: Dedicated Angular Subagents (Stack Parity)

**Files:**
- Create: `agents/angular-signals-specialist.md`
- Create: `agents/angular-signals-reviewer.md`
- Modify: `skills/s8-code-review/resources/task-reviewer-matrix.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: `resources/stacks/frontend/angular.md` and `rules/rules-frontend-angular.md`.
- Produces: Specialist and Reviewer agent personas for Angular 21+ Signals & Zoneless.

- [ ] **Step 1: Create `agents/angular-signals-specialist.md`**
  Define the specialized Angular architect persona (Signals, Zoneless, inject(), OnPush, SSR hydration safety).
- [ ] **Step 2: Create `agents/angular-signals-reviewer.md`**
  Define the rigorous Angular reviewer persona (Signal effect dependency loops, subscription leaks, WCAG 2.2 AA).
- [ ] **Step 3: Update `skills/s8-code-review/resources/task-reviewer-matrix.md`**
  Add explicit routing rule mapping Angular tasks to `angular-signals-reviewer`.
- [ ] **Step 4: Update `README.md` agent catalog**
  Add `angular-signals-specialist` and `angular-signals-reviewer` to the subagents table.
- [ ] **Step 5: Run citation verification**
  Run `node scripts/verify-file-citations.js` to ensure 0 broken links.
- [ ] **Step 6: Commit Task 1**
  Commit with `feat(agents): add angular signals specialist and reviewer personas`.

---

### Task 2: Pre-baked Runtime Smoke Test Templates (S7-B)

**Files:**
- Create: `resources/smoke-templates/springboot-smoke.java`
- Create: `resources/smoke-templates/fastapi-lifespan-smoke.py`
- Create: `resources/smoke-templates/nextjs-smoke.spec.ts`
- Create: `resources/smoke-templates/rust-axum-smoke.rs`
- Create: `resources/smoke-templates/angular-smoke.spec.ts`
- Create: `resources/smoke-templates/README.md`
- Modify: `skills/s7-testing/SKILL.md`

**Interfaces:**
- Consumes: S7-B Runtime Smoke Verification specifications.
- Produces: Ready-to-copy smoke test files for each supported backend and frontend stack.

- [ ] **Step 1: Create smoke templates directory and stack recipes**
  Write realistic, unmocked socket and health check tests for Spring Boot, FastAPI, Next.js, Axum, and Angular.
- [ ] **Step 2: Create `resources/smoke-templates/README.md`**
  Document the smoke test integration pattern for S6 and S7 subagents.
- [ ] **Step 3: Update `skills/s7-testing/SKILL.md`**
  Reference `resources/smoke-templates/` directly in the S7-B Runtime Smoke Verification section.
- [ ] **Step 4: Run citation verification**
  Run `node scripts/verify-file-citations.js` to ensure citations resolve.
- [ ] **Step 5: Commit Task 2**
  Commit with `feat(testing): add drop-in runtime smoke test templates for s7-b gate`.

---

### Task 3: GitHub Actions CI/CD Pipeline

**Files:**
- Create: `.github/workflows/verify-workflow.yml`

**Interfaces:**
- Consumes: Node.js 22+ runner, `scripts/verify-file-citations.js`.
- Produces: Automated pull request and push verification.

- [ ] **Step 1: Create `.github/workflows/verify-workflow.yml`**
  Define GitHub Actions job running `verify-file-citations.js` and JSON syntax validation on push and pull requests.
- [ ] **Step 2: Test script execution locally**
  Run `node scripts/verify-file-citations.js` to verify workflow compatibility.
- [ ] **Step 3: Commit Task 3**
  Commit with `ci(github): add workflow verification pipeline for citations and schemas`.

---

### Task 4: Quickstart S0/S1 CLI Script (`scripts/start-session.ps1`)

**Files:**
- Create: `scripts/start-session.ps1`
- Modify: `README.md`

**Interfaces:**
- Consumes: Target repo path and detected stack markers.
- Produces: Initialized `.agents/session-[SHA]/` directory structure with `CHECKLIST.md` and `context.md`.

- [ ] **Step 1: Implement `scripts/start-session.ps1`**
  Generate session SHA, detect tech stack from file markers (pom.xml, package.json, Cargo.toml, pyproject.toml), create `.agents/session-[SHA]/` tree, copy relevant stack packs into session context.
- [ ] **Step 2: Update `README.md` with CLI usage instructions**
  Document `pwsh scripts/start-session.ps1` as the recommended quickstart launcher.
- [ ] **Step 3: Test `scripts/start-session.ps1` dry-run**
  Execute test run in a temporary test directory.
- [ ] **Step 4: Commit Task 4**
  Commit with `feat(cli): add start-session script for automated s0 s1 bootstrapping`.

---

### Task 5: Version Bump to v1.3.2 & Antigravity Config Synchronization

**Files:**
- Modify: `plugin.json` (`version: 1.3.2`)
- Modify: `README.md`
- Modify: `INVOCATION.md`
- Modify: `INVOCATION-SPEC.md`
- Modify: `resources/workflow-invocation-prompt.md`
- Modify: `resources/spec-invocation-prompt.md`
- Sync Target: `C:\Users\HP\.gemini\config\plugins\plugin 1.2.0\`

**Interfaces:**
- Consumes: All updated repository contents in `ideal-agentic-workflow`.
- Produces: v1.3.2 release commit and synchronized active Antigravity plugins cache.

- [ ] **Step 1: Bump version strings to 1.3.2**
  Update `plugin.json`, `README.md`, `INVOCATION.md`, `INVOCATION-SPEC.md`, `resources/workflow-invocation-prompt.md`, `resources/spec-invocation-prompt.md`.
- [ ] **Step 2: Run full verification suite**
  Run `node scripts/verify-file-citations.js` ensuring 100% pass rate.
- [ ] **Step 3: Commit Task 5 in git**
  Commit with `chore(release): bump plugin version to 1.3.2 and register new subagents`.
- [ ] **Step 4: Synchronize files to `C:\Users\HP\.gemini\config\plugins\plugin 1.2.0\`**
  Copy the updated v1.3.2 tree to the active Antigravity config directory so the agent runtime uses the new code immediately.
