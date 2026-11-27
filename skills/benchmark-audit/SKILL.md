---
name: benchmark-audit
description: "Use whenever measuring performance, reporting a speedup/regression, or vetting a hillclimb harness to validate the limiter, tuning, physical bounds, errors, repeatability, whole-task share, and dead-code guard."
---

# Benchmark Audit

Vet every performance baseline, before/after speedup, or hillclimb metric against all **7 audit questions** using measured command runs before trusting or reporting a number (`EP-01`, `EP-06`, `EP-11`).

For a quick rough ballpark (never for architectural comparisons), verify at least Questions **4** and **7** and explicitly label it a single-run ballpark.

## Pre-Measurement Discipline
1. Write down the exact intended claim first (e.g., *"p50 latency on 50k items drops from 42ms to 19ms"*).
2. Inspect the timing script to confirm what it includes, excludes, and counts.
3. Check CPU/system contention; interleave `A, B, A, B` runs whenever host background noise exists.

## The 7 Audit Questions
1. **Limiter Identified?** Profile cleanly outside the timed run (`node --cpu-prof`, `py-spy`, async/DB trace) and name the bottleneck. Verify the load generator itself isn't saturated.
2. **Production-Tuned Parity?** Compare under realistic prod flags, release builds, connection pools, and matched warm/cold cache states rather than untuned debug defaults.
3. **Within Physical Arithmetic Bounds?** Cross-check throughput against CPU cores, memory/disk/network bandwidth, and Amdahl's Law (`removing a 10% slice yields at most ~11% total speedup`). Claims exceeding physical limits indicate timing broken work or cache shortcuts.
4. **Errors & Output Correctness Counted?** Verify non-2xx responses, aborts, timeouts, and output correctness. Fast failures produce fake speedups.
5. **Repeatable Across `>= 5` Alternating Runs?** Execute at least 5 alternating trials (`A, B, A, B, ...`) and report **median + min-max range**. Deltas smaller than run-to-run jitter are noise.
6. **Whole-Task Share Reported?** Pair any microbenchmark with end-to-end latency at realistic concurrency and state what fraction of the full request the micro-op represents.
7. **Did Work Actually Execute (DCE Guard)?** Prove results were consumed/awaited/persisted inside the timed window rather than skipped by lazy iterators, unawaited promises, or JIT dead-code elimination.

## Output Standard
- Verdict: `faster` | `slower` | `no measurable difference` | `inconclusive` (mark `inconclusive` whenever Questions 1, 2, 4, or 7 remain unverified).
- Concise summary: metric + unit, median & range across `N` alternating runs, error count (`0`), and limiting bottleneck.
