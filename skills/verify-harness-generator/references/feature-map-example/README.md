# Sample App Verification Map

This directory is the maintained source for verifying user-facing behavior end-to-end. Read this index before driving the app, then follow the matching feature recipe.

## Baseline Preconditions

- Launch the app on an isolated ephemeral port (`http://127.0.0.1:4173`) with a disposable data directory.
- Seed clean baseline fixtures before each mutation recipe.
- Run the harness `doctor` check before driving to confirm build revision, URL, and healthy backend state.
- Never drive an unmanaged user process.

## Driving Conventions

- Prefer ARIA roles and accessible labels over CSS selectors or DOM positions.
- Drive UI journeys via the `browser` subagent or Playwright; drive CLI journeys via isolated subprocesses.
- Capture both the user action and the resulting persistent state (e.g., reopen from list / read DB or API back).
- Clean temporary fixtures after mutations without deleting proof artifacts.

## Feature Entry Contract

Each feature file uses one intro paragraph plus four H2 sections in exact order:
1. `Sub-features` — crisp sub-feature IDs and one-line contracts.
2. `How to get to it (user POV)` — every supported entry point (button, URL, shortcut, CLI).
3. `Driving it with <harness>` — preconditions plus action -> command -> expected observable outcome.
4. `Gotchas` — real traps, debounces, or missing prerequisites.

## Features

- [Create a note](./create-note.md) covers UI and terminal creation, cancellation, persistence read-back, and cleanup.
- [Search notes](./search.md) covers toolbar/keyboard/CLI search across matches, empty state, and clear transitions.
