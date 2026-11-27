---
name: design-architect
description: "Use before editing code on cross-boundary changes, ambiguous module APIs, or bug fixes spanning multiple files to trace affected systems, sketch 2 concrete shapes, and pick the cleanest owner before locking in code."
---

# Design Architect

Before writing implementation code across function, module, or service boundaries, trace the full data and state lifecycle, sketch **two distinct architectural shapes**, and choose the one where state has a single owner, callers need minimal context, and invalid states are unrepresentable (`EP-04`, `EP-07`).

## Protocol

1. **Trace Every System Touched**:
   - Read `GEMINI.md` and trace callers, persistence schemas, wire DTOs, and downstream consumers (`<= 150` line slices).
   - Check git history (`git log -S` / blame) for hidden invariants or constraints on why existing code is shaped that way.
2. **Sketch Two Concrete Shapes**:
   - Draft **Shape A** and **Shape B** with exact module files, function/type signatures, data flow, and state ownership rules. Never stop at the first plausible sketch (`EP-02`).
   - Preserve `rules/AGENTS.md` strict modularity laws (`1 OOP type per file`, `<= 1` primary component + `<= 2 inline JSX children` per `.tsx`).
3. **Subtract Before Adding (`EP-04`)**:
   - Check which dead flags, thin pass-through wrappers, or duplicated branches each shape eliminates.
4. **Select & Hand Off**:
   - Choose the shape with the smallest surface area and clearest invariant enforcement.
   - If the architecture remains contested or high-stakes, escalate directly to `skills/solution-arena/SKILL.md` to race parallel candidates before locking `plan.md` in `skills/s3-planning/SKILL.md`.
