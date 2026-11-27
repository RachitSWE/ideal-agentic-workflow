---
name: session-reflect
description: "Use after a completed session or repeated manual steering to inspect Antigravity transcript.jsonl + .agents/session-[SHA]/ friction points and distill recurring preferences or workflow fixes into targeted skill updates."
---

# Session Reflect

Distill what a finished session actually taught into durable workflow or skill improvements rather than leaving lessons buried in chat history (`EP-12`).

## Protocol

1. **Inspect Concrete Evidence**:
   - Read `.agents/session-[SHA]/CHECKLIST.md`, `decision.tsv` (`skills/decision-log/SKILL.md`), `code-review/review/review*.md`, and recent steps in `<appDataDir>/brain/<conversation-id>/.system_generated/logs/transcript.jsonl` (start with compact `transcript.jsonl`; read specific truncated lines in `transcript_full.jsonl` only if needed).
   - Identify repeated tool failures, missed skill triggers, user corrections, or manual steering loops.
2. **Route Findings to the Right Owner**:
   - **Codebase-specific invariant** (`1` repository) -> fix structurally first via `skills/repo-hardening/SKILL.md`, not global rules.
   - **Plugin / skill friction** (`resources/stack-rules/`, `skills/*/SKILL.md` descriptions or track playbooks) -> propose minimal targeted diff with `file:line` justification.
   - **Recurring user preference** -> keep `rules/AGENTS.md` lean under 14KB and encode preferences in modular skills/tracks rather than adding monolithic boilerplate.
3. **Report & Confirm**:
   - Present observed friction entries, proposed edits, and verification checks clearly before mutating shared workflow definitions unless explicitly instructed to apply immediately.
