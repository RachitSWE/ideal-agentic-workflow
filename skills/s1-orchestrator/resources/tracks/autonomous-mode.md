# Track: Long-Running Autonomous Loop (`/autonomous`)

Goal-driven unattended execution bound to a checkable exit predicate, structured decision logs, and clean side-fix isolation (`EP-08`, `EP-09`, `EP-12`).

## Entry Criteria
- User requests an unattended, overnight, or multi-iteration push to an explicit objective predicate (e.g., fix all failing suites, migrate N modules, achieve zero lint/type errors, drive a metric under threshold).
- Trigger keywords: `/autonomous`, `/goal`, "overnight", "keep going until green", "finish all remaining failures".

## Phase Overrides
- **Concrete Exit Predicate**: Before iteration 1, record a deterministic pass/fail predicate in `.agents/session-[SHA]/CHECKLIST.md` (`e.g., npm test && npm run build exit 0, 0 skipped`). Never weaken or relax the predicate to declare completion.
- **Antigravity Scheduling & Subagent Wakeups**: Use native Antigravity `schedule` / event-driven subagent notifications or `swarm` workers — NEVER use shell `sleep` polling. Keep parallel writers in `swarm` `share` / `branch` workspaces (`EP-08`).
- **Mid-Run Side-Fix Ownership (`EP-12`)**: Fix discovered broken scripts, stale harness assertions, or flaky verifiers cleanly inside the loop rather than deferring reversible work. Park **only** irreversible destructive actions, external secrets/payments, or ambiguous product tradeoffs.
- **Decision Logging (`S3`/`S6` Loop)**: After every atomic attempt, append one verified row to `.agents/session-[SHA]/decision.tsv` via `commands/log-decision.ps1` (`skills/decision-log/SKILL.md`). Revert non-advancing edits immediately instead of stacking unverified patches (`EP-09`).

## Verification Standard
- Every kept unit passes local targeted verification before the next unit starts (`EP-09`).
- Final loop exit requires running the exact unmodified exit predicate end-to-end (`S7` 5-Tier + `skills/adversarial-review/SKILL.md`) with clean output observed after the final edit.

## Handoff
- Deliver structured ledger: exit predicate, iterations run (`kept` vs `reverted`), `decision.tsv` path, verified final predicate command output, and commit batches via `commands/auto-commit.ps1`.
- Pair with `skills/session-catchup/SKILL.md` so the user can review unattended changes and pending calls in plain English.
