---
name: blast-radius
description: "Use before shipping or modifying shared helpers, DB queries, schemas, wire formats, or lifecycle hooks to find downstream breakages beyond grep and prove the safety invariant with executable code."
---

# Blast Radius

Find what a change can break outside the diff — across JSON contracts, DB columns, async timing, hook teardown, or downstream callers — and **prove the single safety invariant with executable code** rather than trusting a persuasive writeup (`EP-01`, `EP-06`, `EP-07`).

## Confidence Ladder (Cite Exact Rung Reached)

For every safety claim a diff relies on, drive proof as far down this ladder as possible and report honestly where it stopped:
1. Assertion only *(unacceptable alone)*.
2. Exact source citation (`file:line`) in caller or dependency source.
3. Step-by-step unreachable failure trace.
4. Executed small script/test calling the real module/library and failing loudly if the invariant breaks.
5. Reproduced/verified directly in the running application (`browser` subagent / HTTP integration).

## Execution Steps

1. **Read the Diff & Hidden Behavior**: Inspect added/removed symbols, implicit default changes, serialization tweaks, and lifecycle ordering.
2. **Isolate the Key Safety Fact**: Identify the one or two core assumptions that make this change safe (e.g., *"Null values only occur for unverified legacy rows filtered upstream before step 2"*).
3. **Trace Where Grep Cannot See**:
   - Inspect third-party dependency code inside `node_modules/` / site-packages / crates rather than guessing from docs.
   - Check JSON wire schemas, Flyway/Prisma SQL constraints, CSS containing blocks, React effect teardown timing, and cross-service consumers.
4. **Separate Confirmed Risks From Cleared Paths**: Give every real risk its likelihood, blast impact, and exact `file:line`; list explicitly verified-safe paths separately.
5. **Prove the Fact Live**: Run a targeted script or test exercising the exact real code path (`commands/` or `.agents/session-[SHA]/`) and include verbatim command + output. Escalate wide or high-stakes diffs to `skills/solution-arena/SKILL.md`.
