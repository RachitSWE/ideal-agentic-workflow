---
name: session-catchup
description: "Use when returning to an in-progress or unattended session to summarize what changed in code, what tests passed, and what decisions wait on the user in plain language with clickable file links."
---

# Session Catch-Up

Give a returning user a fast, accurate catch-up across recent commits, uncommitted working-tree edits, `.agents/session-[SHA]/` state, and `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl` so every open decision can be resolved from the reply alone (`EP-09`, `EP-11`).

## Protocol

1. **Gather Ground Truth First**:
   - Check `git status --short`, `git log -n 10 --oneline`, `.agents/session-[SHA]/{task.md,CHECKLIST.md,decision.tsv}`, and recent user/assistant milestones in `transcript.jsonl`.
2. **Present Structured Plain-English Summary**:
   - **What Changed**: Grouped outcome bullets with clickable `file:///` links to modified files or screenshots/visuals.
   - **Verified Status**: Exact latest test/build/scanner checks executed and their verified outcomes (zero invented passes).
   - **Decisions Waiting on You**: Numbered list of open choices with clear tradeoffs and recommended default so the user can reply in one line.
3. **Apply `skills/prose-polish/SKILL.md`**: Strip throat-clearing and status filler so the catch-up fits on one screen whenever possible.
