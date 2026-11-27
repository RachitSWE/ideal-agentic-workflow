# Track: Pixel-Exact Visual Parity (`/visual-parity`)

Baseline-locked UI migration or redesign verified against real rendered screenshots and image diffs rather than eyeballing (`EP-01`, `EP-06`, `EP-08`, `EP-09`).

## Entry Criteria
- Migrating UI components across frameworks/design tokens, cloning a reference screen, or fixing subtle layout/CSS regressions where visual fidelity must stay exact across states and viewports.
- Trigger keywords: `/visual-parity`, "pixel-exact", "visual regression", "match mockup", "visual parity".

## Phase Overrides
- **Baseline Screenshot First (Blocking)**: Before editing target UI components, capture baseline screenshots across all required states (`default`, `hover`, `focus`, `error`, `mobile`, `desktop`) using the `browser` subagent or Playwright harness and store baselines in `.agents/session-[SHA]/visual-baseline/`.
- **Anti-Tamper Lock**: Never modify the baseline image, loosen diff tolerance thresholds, or restructure unrelated layout tests just to pass a pixel diff. If the baseline itself contains a design defect, stop and confirm with the user before changing it.
- **Shared Primitives First -> Parallel Migration**: Migrate shared design-system tokens/primitives first, then parallelize independent page/component migrations across `swarm` `share`/`branch` workspaces (`EP-08`).
- **Structural UI Rules Stay Enforced**: Maintain `rules/AGENTS.md` strict `.tsx` constraints (`<= 1` primary component, `<= 2 inline JSX children` per file, Portal breakout, `44x44px` touch targets, `aspect-ratio` framing).

## Verification Standard
- Drive each migrated component via the `browser` subagent / Playwright visual harness across all captured states and inspect both automated pixel-diff delta (`0` / within agreed subpixel AA tolerance) and real rendered screenshots (`EP-06`).

## Handoff
- Report components migrated, per-state baseline vs migrated screenshot diffs (`file:///` paths), harness location, and remaining components.
- Route through `S8` review + `S10` `commands/auto-commit.ps1`.
