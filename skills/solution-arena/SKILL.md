---
name: solution-arena
description: "Use when two or more competing designs exist for a non-trivial module, algorithm, or UI architecture to run parallel candidates in isolated swarm workspaces, cross-judge blind, graft the strongest parts, and verify the merged result."
---

# Solution Arena

Spawn $N$ independent parallel candidates on the same well-defined contract, evaluate them blind with an independent judge (`agents/arena-cross-judge.md`), graft the strongest ideas by hand under a single cohesive mental model, and verify the unified artifact (`EP-02`, `EP-06`, `EP-08`).

## Phases

### Phase A: Frame & Derive Rubric
1. Define the exact output artifact and interface contract. Everyone receives the same contract and shared grounding paths.
2. Derive **3–6 concrete gradeable rubric criteria** (e.g., correctness on edge case X, modular file split, reader cognitive load, live runtime speed). Candidates see the contract only — keep judging criteria anchored for Phase C/D.
3. Isolate each candidate via native Antigravity `swarm` (`action: "add"`, `workspace: "branch"` or `"share"`) or `invoke_subagent` with `Workspace: "branch"` (`EP-08`) using `agents/empirical-worker.md`.

### Phase B: Parallel Fan-Out
Spawn all $N$ candidates in parallel (`swarm` or `invoke_subagent`), each writing its implementation plus a concise rationale naming considered alternatives and rejected paths into its isolated workspace or `.agents/session-[SHA]/arena/candidate-<n>/`. Proceed cleanly with $N-1$ if a candidate drops out.

### Phase C: Blind Cross-Judge
Once Phase B finishes, spawn `agents/arena-cross-judge.md` (read-only) with candidate labels (`Candidate 1..N`), paths, and the rubric. The judge scores every criterion per candidate and recommends a base without mutating files.

### Phase D: Pick a Base
Read every candidate end to end yourself (`EP-10`), compare rubric scores with `arena-cross-judge.md` (investigate disagreements rather than averaging blindly), and select the base with the cleanest module boundary and lowest reader load (`EP-03`).

### Phase E: Hand-Graft Cohesively
Inspect losing candidates for 1–2 superior edge-case guards, helper splits, or test assertions worth porting. Re-implement those grafts cleanly by hand into the selected base (`EP-04`) — never paste conflicting abstractions together. If candidates converged on one shape, ship the consensus directly without grafting.

### Phase F: Verify & Report
Run `skills/s7-testing/SKILL.md` (and `skills/adversarial-review/SKILL.md` for critical paths) on the merged result. Output: base selected + why, cross-judge verdict, each graft + source, rejected alternatives, and live verification output.
