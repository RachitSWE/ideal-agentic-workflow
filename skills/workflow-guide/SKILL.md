---
name: workflow-guide
description: "Use when the user asks how the ideal-agentic-workflow plugin works, what rules apply to this workspace, which track or skill to pick, or how to phrase a starter prompt without mutating repo files."
---

# Workflow Guide (Read-Only Assistant & Track Selector)

Answer questions about `ideal-agentic-workflow` v2.0, explain what rules apply in the current repository, recommend the right track or specialist skill, and provide a copyable starter prompt. **Do NOT mutate workspace code or initialize a full session** when the user only asks how to use the workflow.

If the user explicitly asks to perform engineering work (e.g., *"fix this bug"*, *"add feature X"*), do NOT stop in this guide — dispatch immediately via `skills/s1-orchestrator/SKILL.md`.

---

## 1. Live Workspace Rules Inspection

Before answering *"What rules will you follow?"* or recommending verification steps, inspect what actually exists in the current repository:
1. Check `GEMINI.md` (present vs missing -> recommend `skills/s0-repo-architect/SKILL.md` if missing).
2. Report the active plugin layers from `rules/AGENTS.md`:
   - `GEMINI.md` (Project Truth)
   - `rules/AGENTS.md` (`AP-001..AP-010`, `EP-01..EP-12`, strict `1 OOP type/file` & `<= 2 inline JSX children` per `.tsx`)
   - `skills/s1-orchestrator/SKILL.md` (Track Router)
   - `resources/stack-rules/rules-*.md` + `resources/stacks/*.md` matching detected stacks
   - `skills/s7-testing/SKILL.md`, `skills/s8-code-review/SKILL.md`, `skills/s10-git-commit/SKILL.md`, `skills/s11-gemini-update/SKILL.md`
3. Check whether a repo-local Playwright/CLI harness (`.agents/skills/verify-*/SKILL.md`) or TLA+ formal suite (`skills/statechart/SKILL.md` / `.agents/skills/formal-verify-*/`) exists, and mention `skills/verify-harness-generator/SKILL.md` or `skills/formal-verify-generator/SKILL.md` when verification/race safety is discussed.

---

## 2. Track & Skill Selector Matrix

| User Situation | Recommended Track / Skill | Why |
|---|---|---|
| New feature, DB migration, multi-module design | **Standard (`S2 -> S11`)** or **Spec (`SP1 -> SP6`, `skills/spec-architect-pipeline/SKILL.md`)** | Preserves `S3` planning + `S4` unanimous LGTM gate before code (`Option A`) |
| Bug, regression, runtime trace, heap leak | `skills/s1-orchestrator/resources/tracks/bugfix-mode.md` | Enforces live repro first + empirical hypothesis elimination |
| Slow endpoint, UI jank, optimization target | `skills/s1-orchestrator/resources/tracks/perf-hillclimb-mode.md` + `skills/benchmark-audit/SKILL.md` | Freezes benchmark harness + single-variable decision log |
| Comparing UI layouts or timing options | `skills/s1-orchestrator/resources/tracks/prototype-mode.md` | Fast throwaway scratch build behind a variant switcher |
| Understanding code or git history (`why?`) | `skills/s1-orchestrator/resources/tracks/investigation-mode.md` | Read-only cited explanation (`0` edits) |
| Behavior-preserving cleanup or migration | `skills/s1-orchestrator/resources/tracks/refactor-mode.md` | Requires behavioral pin before moving structure |
| Overnight / unsupervised goal completion | `skills/s1-orchestrator/resources/tracks/autonomous-mode.md` + `skills/decision-log/SKILL.md` | Checkable exit predicate + `commands/log-decision.ps1` |
| Pixel-exact component migration | `skills/s1-orchestrator/resources/tracks/visual-parity.md` | Baseline screenshots + image diff verification |
| Pre-code architecture alternatives | `skills/design-architect/SKILL.md`, `skills/solution-arena/SKILL.md`, `skills/blast-radius/SKILL.md` | Sketches 2+ designs or races parallel `swarm` branches |
| Proof-backed code review & comment hygiene | `skills/adversarial-review/SKILL.md`, `skills/comment-audit/SKILL.md` | Drops unproven nits; requires live failing proof |
| Concurrency / retry / state-machine race proof | `skills/statechart/SKILL.md`, `skills/formal-verify-generator/SKILL.md`, `commands/invoke-statechart.ps1` | TLA+ model checking + Mermaid counterexamples |
| Batch smart commits (`S10`) | `commands/auto-commit.ps1` (`scripts/auto-commit.mjs`) | Cluster-aware `<= 150` LOC batches + Conventional Commits |
| Preventing repeat AI/repo mistakes | `skills/repo-hardening/SKILL.md`, `skills/session-reflect/SKILL.md` | Encodes structural invariants in code/types/lints first |
| Human catch-up, clarity, prompt rewriting | `skills/session-catchup/SKILL.md`, `skills/plain-summary/SKILL.md`, `skills/prose-polish/SKILL.md`, `skills/prompt-sharpen/SKILL.md`, `skills/context-recall/SKILL.md`, `skills/workflow-eval/SKILL.md` | Plain-English summaries, A/B evals, sharper prompts |

---

## 3. Copyable Starter Prompts

- **Bugfix**: `Use bugfix track to diagnose and fix <symptom>. Reproduce live first, show failing-then-passing verification output, and keep edits minimal.`
- **Feature**: `Implement <feature> using Standard Track. Keep existing <behavior> unchanged and verify end-to-end.`
- **Performance**: `Measure why <operation> takes <time> on <workload> using perf-hillclimb-mode + benchmark-audit. Fix the bottleneck and show before/after numbers.`
- **Investigation**: `Use investigation-mode (read-only) to trace how <subsystem> works and why <constant/branch> was added. Do not edit files.`
- **Autonomous Overnight**: `Run autonomous-mode in a separate branch/worktree until "<exact test/build command>" exits 0. Log each attempt to decision.tsv; stop only when passing or blocked.`
- **Review Whole Branch**: `Run adversarial-review on the current uncommitted diff. Only report bugs backed by live reproduction or concrete invariant violations; show the Dropped table too.`
