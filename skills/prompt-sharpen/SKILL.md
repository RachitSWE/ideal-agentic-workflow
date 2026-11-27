---
name: prompt-sharpen
description: "Use when a user wants to clarify a messy request, reframe a problem with sharper domain terminology, restate intent before coding, or tighten a prompt before execution without modifying repository files."
---

# Prompt Sharpen (Restate, Reframe & Sharpen)

Turn an ambiguous request into an accurate, actionable engineering brief before spending tokens on the wrong target (`EP-09`, `EP-11`). Read-only: **do NOT modify source files** unless explicitly asked to start execution after sharpening.

## Modes Supported
1. **In Your Own Words**: Restate the user's messy/noisy report concisely in 3–4 plain sentences (Goal, Non-Goal, Observable Pass Check, Open Ambiguity) so misunderstandings surface before code exists.
2. **Reframe With Exact Terminology**: Map vague descriptions onto accurate domain concepts and real symbols/files inspected in the repo (verify every cited symbol directly in code).
3. **Sharpen Starter Prompt**: Return one crisp, copy-ready prompt naming:
   - Concrete **goal** and **matching track** (`bugfix-mode`, `perf-hillclimb-mode`, `Standard Track`, etc.)
   - Checkable **done predicate** (exact command or live user journey)
   - Required **proof** (failing-then-passing output, before/after median, `browser` screenshot)
   - Explicit constraints (*"reproduce first"*, *"zero behavior change"*, *"do not commit"*).
