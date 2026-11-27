---
name: plain-summary
description: "Use when the user asks to translate a dense architecture explanation, stack trace, or multi-step proposal into crisp, plain everyday English without jargon."
---

# Plain Summary

Restate the preceding analysis, system design, or error trace in plain everyday English so anyone on the team can immediately verify assumptions and make the right call (`EP-11`).

## Rules
1. State what actually broke or what changes in **under 5 short sentences** first.
2. Replace internal symbol soup with concrete user/system behavior (*"When someone saves a role in the Whitelist screen, it saves `'Supreme:High Command'`, but the permission reader looks for `'des_supreme:High Command'`"*), keeping exact identifiers in parentheses only where precision helps.
3. Explicitly highlight: **What goes wrong**, **Why**, **What the fix changes**, and **What could still go wrong**.
4. Make zero code edits while summarizing.
