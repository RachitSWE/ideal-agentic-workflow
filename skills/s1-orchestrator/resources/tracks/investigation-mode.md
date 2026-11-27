# Track: Read-Only Investigation (`/investigate`)

Cited read-only codebase research, architecture explanation, root-cause tracing, or tradeoff analysis with zero filesystem mutations (`EP-11`).

## Entry Criteria
- User asks how something works, why a pattern/threshold exists (`git log -S` / blame archaeology), "are we sure?", or wants an options tradeoff table without requesting code edits.
- Trigger keywords: `/investigate`, "how does X work", "why is Y set to", "explain this subsystem", "should we do A or B".

## Phase Overrides
- **Strict Read-Only Quarantine**: Skip `S3`, `S5`, `S6`, `S9`, and `S10`. Do NOT modify repository source files (`commands/verify-scope.ps1` is unnecessary when `git status` remains unchanged).
- **Trace Real Code & History**:
  - Read `GEMINI.md` first (`rules/AGENTS.md` Layer 1), then trace callers, handlers, tests, and schemas directly in source files (`<= 150` line slices).
  - For motivation/magic-number questions ("why does this sleep 3s or catch X?"), run `git log -S` / `git blame` / `skills/comment-audit/SKILL.md` to cite the originating commit or PR rationale.
- **De-Fluff Output**: Apply `skills/prose-polish/SKILL.md` principles — concise Overview, Key Concepts, How It Works, Where Things Live (with clickable `file:///` links), and Gotchas / Tradeoff Matrix.

## Verification Standard
- Every file path, symbol name, condition, and behavior cited MUST be directly observed in files read during the current session (`0` memory-guessed symbols).
- Confirm `git status --short` shows zero unintended edits.

## Handoff
- Deliver cited answer directly (push back clearly if the user's premise contradicts inspected code/logs).
- If the investigation concludes a fix or feature is needed, ask whether to launch `bugfix-mode` or `Standard Track`.
