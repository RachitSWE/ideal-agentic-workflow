# Track: Throwaway Prototype & Design Fork (`/prototype`)

Rapid throwaway exploration in an isolated scratch workspace to settle UX, timing, or architectural ambiguity cheaply before production engineering (`EP-03`).

## Entry Criteria
- Request asks to explore layout options, interaction feel, animation timing, visual direction, or competing API/runtime approaches where committing early to production architecture would waste effort.
- Trigger keywords: `/prototype`, "mock up options", "explore 3 layouts", "compare approaches", "throwaway".

## Phase Overrides
- **Explicit Scope Exemption (`EP-03` Inversion)**: Normal production modularity ceilings and `S3 -> S4` heavy planning are suspended **strictly inside** an isolated scratch directory (`.agents/session-[SHA]/prototype/` or `<Artifact Directory Path>/scratch/`). Never write throwaway code inside `src/`, `app/`, or tracked production packages.
- **No Decision = No Prototype**: First state the concrete design choice the prototype resolves (layout A vs B vs C, timing 150ms vs 300ms, streaming vs polling).
- **Variant Switcher (`EP-03`)**: When comparing UI or behavioral alternatives, render >= 2 labeled variants behind a simple UI switcher or CLI flag so side-by-side comparison takes seconds.
- **Optional Moodboard / Multi-Candidate Exploration**: Pair with `skills/design-architect/SKILL.md` or `skills/solution-arena/SKILL.md` when choosing between architectural shapes.

## Verification Standard
- Observe behavior directly on the matching surface: screenshot each UI variant via the `browser` subagent or record real timing/output logs for CLI/backend spikes.
- Verify no production source files were modified (`git status --short` shows clean prod tree before switching back to `Standard Track`).

## Handoff
- Present explored variants, tradeoffs, observed screenshots/timings, and your recommendation, explicitly marking the artifact **throwaway**.
- Once the user selects a direction, clear/archive scratch artifacts and transition cleanly into **Standard Track (`S2 -> S3 -> S4 -> S6`)** for production implementation under full strict invariants.
