---
name: context-recall
description: "Use when starting a fresh session on an ongoing initiative to search prior .agents/session-[SHA]/ plans/decision logs, recent git commits, and Antigravity transcript.jsonl logs before re-investigating from scratch."
---

# Context Recall

Recover prior decisions, failed hypotheses, and exact file locations from earlier work on a topic so a new conversation picks up with full continuity instead of repeating dead ends (`EP-09`, `EP-11`).

## Search Sources (Read-Only)
1. **Local Workflow Artifacts**: Search `.agents/session-*/{plan.md,task.md,decision.tsv,CHECKLIST.md}` and `docs/superpowers/` plans/specs if present in the workspace.
2. **Git History**: Run targeted `git log --oneline --grep="<topic>"` or `git log -S "<symbol>"` to inspect prior commits and reverts.
3. **Antigravity Conversation Logs**: Inspect relevant prior sessions under `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl` (start with compact `transcript.jsonl`; read specific truncated entries in `transcript_full.jsonl` only when needed).

## Output
Deliver a concise brief: **Previous Outcome**, **Attempted / Rejected Approaches**, **Current Repo State (`git log` / files)**, and **Recommended Continuation Step** (linking every cited artifact with `file:///`).
