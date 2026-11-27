---
name: verify-harness-maintainer
description: "Use periodically or after major UI/API changes to reconcile a project-local .agents/skills/verify-*/ verification skill and feature map against current source code and re-drive every mapped feature live."
---

# Verification Harness Maintainer

Feature maps drift as soon as UI labels, routes, or CLI flags evolve. Keep `.agents/skills/verify-<app>/SKILL.md` and `features/*.md` synchronized with reality without modifying production app logic (`EP-06`, `EP-10`).

## Outcomes (Report Exactly One)
- **`clean`** — every mapped feature matched source and passed live execution; no edits needed.
- **`changed`** — verified doc drift or broken harness helpers fixed inside `.agents/skills/verify-<app>/`.
- **`blocked`** — live execution revealed a broken product behavior or unmet external prerequisite (report defect cleanly instead of softening the harness).

## Maintenance Pass
1. **Locate Target**: Find `.agents/skills/verify-*/` in the project (if missing, route to `skills/verify-harness-generator/SKILL.md`). Never edit app `src/` during maintenance; product regressions get reported as bugs (`bugfix-mode`).
2. **Parallel Read-Only Source Check**: Spawn read-only subagents across `features/*.md` to compare documented entry points, selectors, and CLI flags against current source files and git churn.
3. **Full Live Pass (`browser` / CLI)**:
   - Run `Doctor` before driving and after any failure; relaunch if UI state wedges.
   - Exercise every mapped feature live from start to finish and verify proof artifacts survive cleanup.
   - Re-drive any fixed harness selector live before reporting **`changed`**.
