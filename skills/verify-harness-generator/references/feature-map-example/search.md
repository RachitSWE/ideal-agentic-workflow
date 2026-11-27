# Search notes

Search lets a user query notes by title or body, navigate to matching results, and distinguish empty matches from search errors.

## Sub-features

- `search-open` opens search from toolbar or keyboard shortcut.
- `search-match` filters live by title and body without mutating stored data.
- `search-empty` renders an explicit empty-state message when zero items match.
- `search-clear` restores the full list when cleared.
- `search-cli` matches UI query semantics from the terminal.

## How to get to it (user POV)

- Click `Search` in the toolbar.
- Press `/` outside editable inputs.
- Run `notes search <query> --format json`.

## Driving it with Playwright / CLI

Preconditions:

- Baseline seeded note `Quarterly plan` (`Draft budget`) and `Grocery list` exist.

- **Open & Title Match**: Open search (`Search` button or `/`), type `quarterly`, and verify `Quarterly plan` appears while `Grocery list` disappears.
- **Body Match & Open Result**: Search `budget`, click `Quarterly plan`, confirm editor loads that note.
- **Empty & Clear States**: Search `volcano`, confirm empty status (`No matching notes`), click `Clear search`, and confirm `Recent notes` restores.
- **CLI Match & Miss**: Run `notes search "quarterly" --format json` (1 item) and `notes search "volcano" --format json` (`[]`).
- **Capture Proof**: Save `.agents/verify-artifacts/search/results.png` + `.aria.txt`.

## Gotchas

- Wait for debounced results region or empty-state locator rather than hardcoded sleeps.
- Pressing `/` inside a focused input must insert text rather than opening modal search.
