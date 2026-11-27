---
name: verify-harness-generator
description: "Use when a repository has no scripted end-to-end user-POV verification harness (or lacks S7-B/S7-D runtime smoke coverage) to generate .agents/skills/verify-<app>/SKILL.md and a feature map, then run 1 full live proof before handoff."
---

# Verification Harness Generator

Generate a project-local verification skill under `.agents/skills/verify-<app>/` that launches the real application, verifies readiness, exercises user flows through the actual interface (`browser` subagent / Playwright, PTY/CLI, or real HTTP), captures proof artifacts, and cleans up cleanly without destroying evidence (`EP-01`, `EP-06`, `EP-10`).

---

## 1. Interview the Repository First (Minimize User Prompts)

Determine these five facts directly from repo manifests, configs, and entrypoint source files:
- **Surface**: Web UI, API service, CLI/TUI, desktop app, or library.
- **Launch**: Exact local startup command, DB migrations/seed commands, readiness probe (not just open port — usable app state), env vars, and isolated port/data-dir knobs.
- **Drive**: Reuse existing Playwright/Cypress/CLI scripts first; otherwise drive UI via Antigravity `browser` subagent / Playwright (`getByRole` / ARIA handles, avoiding brittle coordinates) or drive CLIs via isolated PTY/subprocess calls.
- **Observe**: Screenshots, ARIA/DOM snapshots, response status + JSON bodies, exit codes, and read-back persistence queries (never trust only a toast).
- **Isolate**: Whether two test runs can execute side-by-side (`PORT`, temp SQLite/data dirs); if single-instance only, state the lock/exclusion rule explicitly.

---

## 2. Generate `.agents/skills/verify-<app>/SKILL.md`

Include valid YAML frontmatter (`name: verify-<app>`, descriptive trigger `description`) and concrete, zero-placeholder sections grounded in repo reality:
- **`Launch`**: Exact bootstrap + readiness check + clean PID-tracked teardown.
- **`Doctor`**: Fast read-only preflight check proving the running instance matches our build, port, and auth expectations.
- **`Drive`**: Concrete commands, URLs, roles, and flags from this codebase.
- **`Evidence`**: What actions + post-action states to save (UI screenshot + read-back persistence check, CLI stdout/stderr + exit code) and where artifacts live (`.agents/verify-artifacts/`).
- **`Cleanup`**: Kill only processes started by this run; remove scratch fixtures **never** proof artifacts.

---

## 3. Seed the User-POV Feature Map

Create `.agents/skills/verify-<app>/features/README.md` plus `features/<feature>.md` for the top 3–5 critical user flows following `skills/verify-harness-generator/references/feature-map-example/README.md` (`skills/verify-harness-generator/references/feature-map-example/create-note.md` and `skills/verify-harness-generator/references/feature-map-example/search.md`):
- Four required H2s per feature: `Sub-features`, `How to get to it (user POV)`, `Driving it with <harness>`, and `Gotchas`.
- Never weaken assertions when seed data is incomplete; fail loudly and document missing prerequisites under `Gotchas`.

---

## 4. Mandatory End-to-End Proof Before Handoff

Execute the generated skill live once from start to finish: `Launch -> Doctor -> Drive 1 mapped feature -> Capture Evidence -> Cleanup -> Verify Evidence Survived Cleanup`. Fix any broken selector, readiness timing, or cleanup bug before declaring the harness ready, then link `skills/verify-harness-maintainer/SKILL.md` for ongoing upkeep.
