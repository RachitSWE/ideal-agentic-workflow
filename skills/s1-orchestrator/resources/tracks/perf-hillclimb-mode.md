# Track: Performance & Hillclimb (`/perf`, `/hillclimb`)

Measurement-first latency/throughput diagnosis and sustained single-variable iterative optimization (`EP-01`, `EP-05`, `EP-06`, `EP-09`, `EP-11`).

## Entry Criteria
- User reports slow execution, high memory/CPU usage, sluggish UI frames, or requests sustained metric optimization toward a numeric target.
- Trigger keywords: `/perf`, `/hillclimb`, "slow", "optimize", "latency", "benchmark", "throughput".

## Phase Overrides
- **One-Off Perf Issue vs Sustained Hillclimb**:
  - Single bottleneck fix: baseline trace -> hypothesis -> fix -> compare.
  - Sustained improvement (`hillclimb`): define workload dimensions, direction ("lower/higher is better"), target threshold, and minimum iteration floor (`>= N` iterations so lucky noise never halts early).
- **Performance Mantra Order (cheapest first)**:
  1. Do not do unused work.
  2. Cache / do not recompute identical work.
  3. Batch / reduce frequency.
  4. Defer off critical path.
  5. Background outside interactive frames.
  6. Parallelize safely (`EP-08` isolate state first).
  7. Optimize the hot instruction/algorithm.
  Stop immediately for one-off perf issues once an earlier step meets the target.
- **S3/S4 Planning**: Freeze the benchmark harness BEFORE editing production code. Record baseline numbers + error counts + regression gate status in `.agents/session-[SHA]/decision.tsv` via `skills/decision-log/SKILL.md` (`commands/log-decision.ps1`).
- **Iteration Discipline**: Strictly one hypothesis per iteration (`EP-05` `10%` complexity check). Dispatch parallel independent hypotheses only inside isolated `swarm` `branch`/`share` workspaces (`EP-08`). Revert losing or regressive changes immediately; commit each kept improvement cleanly (`git add <files>`, never `git add .`).

## Verification Standard
- Every baseline and post-change number MUST pass all 7 gates of `skills/benchmark-audit/SKILL.md` (real bottleneck identified, bounds checked, `0` silent errors, `>= 5` alternating runs, whole-task share vs microbench, DCE guard).
- Existing correctness tests (`S7`) MUST stay 100% green on every kept iteration.

## Handoff
- Report metric target, baseline -> final delta (`%`), iterations kept vs reverted, `decision.tsv` path, and top next un-tested hypothesis.
- Proceed to `S8` review + `S10` batch commit (`commands/auto-commit.ps1`).
