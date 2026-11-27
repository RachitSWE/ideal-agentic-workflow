---
name: decision-log
description: "Use during autonomous loops, performance hillclimbing, or multi-step debugging to append each hypothesis, evidence, and keep/revert verdict cleanly to .agents/session-[SHA]/decision.tsv via commands/log-decision.ps1."
---

# Decision Log

Keep a structured, spreadsheet-safe `decision.tsv` inside `.agents/session-[SHA]/decision.tsv` whenever running iterative loops (`perf-hillclimb-mode`, `autonomous-mode`, or multi-hypothesis debugging) so resumed agents and reviewing humans see every tried hypothesis and why it landed or got reverted (`EP-09`, `EP-11`).

## Schema & Tooling

- Header schema (`skills/decision-log/references/decision-log-template.tsv`):
  `ts | phase | decision | why | action | evidence | result`
- Always write rows via `commands/log-decision.ps1` (`powershell -File commands/log-decision.ps1 -SessionDir .agents/session-[SHA] -Phase ... -Decision ... -Action keep|revert|edit|note -Evidence ...`), which strips embedded tabs/newlines and neutralizes leading spreadsheet formula characters (`=`, `+`, `-`, `@`).
- Read the existing `decision.tsv` before starting the next iteration or picking up a paused session so you never repeat a reverted hypothesis.
