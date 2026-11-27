# Track: Bugfix & Live Forensics (`/bugfix`)

Scientific bug isolation, live capture forensics, and minimal evidence-backed fixes (`EP-01`, `EP-06`, `EP-07`).

## Entry Criteria
- User reports a defect, regression, crash, memory leak, performance glitch, or broken runtime flow.
- An existing trace/heap/profile artifact or live failing endpoint/UI journey needs deterministic root-cause isolation before code edits.
- Trigger keywords: `/bugfix`, "fix this bug", "regression", "broken", "stack trace", "forensics", "diagnose".

## Phase Overrides
- **S2 Codebase Audit**: Narrow S2 strictly to the failing component, its callers/writers, and regression history (`git log -S` / `skills/comment-audit/SKILL.md` history check).
- **S3/S4 Planning**: Single-unit defects skip formal `S4` multi-agent plan review **only** after live reproduction succeeds; capture root cause and exact `target_files` in `.agents/session-[SHA]/plan.md` (`skills/s3-planning/SKILL.md`). If the fix crosses module boundaries or changes public APIs/schemas, escalate to `skills/design-architect/SKILL.md` and run `Standard Track` (`S3 -> S4`).
- **Live Reproduction First**:
  1. Reproduce on the matching user surface yourself (`browser` subagent for UI/web apps, real HTTP/CLI request for APIs, existing capture query via SQLite/parser for static `.cpuprofile`/`.heapsnapshot` artifacts). Never ask the user to reproduce unless a gated external credential/hardware boundary physically blocks local execution.
  2. Binary-search hypotheses using runtime instrumentation or targeted logs; parse large traces inside a dedicated subagent (`EP-11` guard context) and discard any speculative "belt-and-suspenders" change refuted by runtime facts.
- **TDD Sequence (`EP-09`)**: Write the failing repro test first, observe RED, implement the minimal verified fix (`S9` / `S6`), and observe GREEN.

## Verification Standard
- **Same-Surface Proof**: The original reproduction command or `browser` journey MUST transition from FAIL to PASS after the fix (`skills/s7-testing/SKILL.md`). Unit-only passes do not close an integration or UI bug.
- **Execution-Backed Review (`S8`)**: Run `skills/adversarial-review/SKILL.md` when the change spans multiple files or alters shared guards/middleware.

## Handoff
- Write root-cause summary + exact failing-then-passing reproduction output into `.agents/session-[SHA]/CHECKLIST.md`.
- Hand to `S10` (`commands/auto-commit.ps1` or `commands/stage-commit.ps1`) preserving the repro test and minimal fix, then run `S11` (`skills/repo-hardening/SKILL.md`) if a structural guard could prevent the entire bug class.
