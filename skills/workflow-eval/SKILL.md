---
name: workflow-eval
description: "Use when comparing workflow tracks, skill revisions, or agent prompts via blinded A/B evaluation against Antigravity transcript.jsonl tool traces, test pass rates, and diff quality."
---

# Workflow Eval (Blinded A/B Evaluation)

Evaluate whether a skill edit, track change, or prompt variant genuinely improves real engineering execution rather than relying on subjective impression (`EP-06`, `EP-10`).

## Evaluation Protocol

1. **Define Task Pair & Objective Metrics**:
   - Select concrete evaluation criteria before inspection (repro accuracy, scope-jail compliance, live test pass rate, review rejection rounds, token/step efficiency, defect escape rate).
   - Isolate baseline (`Variant A`) and candidate (`Variant B`) in separate clean worktrees (`swarm` `workspace: "branch"`).
2. **Trace Execution Evidence**:
   - Inspect tool call sequences, subagent spawns, test exit codes, and error recovery patterns across `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl` and `.agents/session-[SHA]/decision.tsv`.
3. **Blind Cross-Judge (`agents/arena-cross-judge.md`)**:
   - Strip variant labels (`Baseline` vs `New`) when handing final diffs and execution logs to `agents/arena-cross-judge.md` so scoring stays unbiased.
4. **Verdict**:
   - Report per-criterion scores, win/tie/loss summary, concrete behavioral deltas observed in `transcript.jsonl`, and recommendation (`keep` | `revert` | `refine`).
