---
name: prose-polish
description: "Use when drafting or cleaning documentation, RFCs, READMEs, PR summaries, or agent replies to strip filler, inflated claims, and repetitive AI-generated prose."
---

# Prose Polish

Tighten engineering writing (`README.md`, ADRs, PR descriptions, investigation writeups, or skill docs) so every sentence carries verifiable technical information (`EP-03`).

## Checklist
1. **Cut Throat-Clearing & Hype**: Remove *"In this comprehensive document..."*, *"rigorous enterprise-grade uncompromising"*, *"cleanly seamlessly orchestrates"*, and restating section titles twice.
2. **Replace Abstract Nouns With Concrete Mechanics**: Instead of *"improves system resilience"*, write *"retries HTTP 429 up to 3 times with capped backoff"*.
3. **Cite Observed Facts Only**: Every file path, flag, command output, and line reference must come from directly inspected files/output.
4. **Match Medium**: Tables for structured comparisons, short bullet lists for ordered steps, crisp one-line code examples — never walls of redundant prose.
