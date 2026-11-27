# Create a note

Create note lets a user save a titled note from the browser or CLI, discard an unfinished draft, and confirm persistence via a second read-only view.

## Sub-features

- `create-open` opens a clean editor from every entry point.
- `create-save` persists title and body across reloads.
- `create-cancel` discards an unsaved draft cleanly.
- `create-cli` creates the same record structure from the terminal.

## How to get to it (user POV)

- Click `New note` in the toolbar.
- Press `n` while focus is outside text inputs.
- Run `notes create --title <title> --body <body>` in a terminal.

## Driving it with Playwright / CLI

Preconditions:

- App is healthy on the isolated verification URL (`doctor` check passed).
- No fixture titled `Release checklist` exists yet.

- **Open & Enter Content**: Click button `New note`, fill `Title` (`Release checklist`) and `Body` (`Tag and publish`), confirm `Save note` enables.
- **Save & Re-Verify Persistence**: Click `Save note`, confirm `Note saved` status, navigate back to `All notes`, reopen `Release checklist`, and verify both fields match stored values.
- **Cancel Draft**: Click `New note`, type `Discard me`, click `Cancel`, and confirm `Discard me` is absent from `All notes`.
- **CLI Creation**: Run `notes create --title "CLI note" --body "Created from terminal" --format json` and assert exit code `0` + JSON payload, then verify visibility in UI.
- **Capture Proof**: Save screenshot + DOM/ARIA snapshot under `.agents/verify-artifacts/create-note/`.

## Gotchas

- Keyboard shortcut `n` must not hijack active input typing.
- A transient toast alone is NOT proof of persistence — always reload/reopen from list.
- Delete created test fixtures during cleanup while keeping `.agents/verify-artifacts/` intact.
