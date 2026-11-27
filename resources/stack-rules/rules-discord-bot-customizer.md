# Critical Domain Rules: Discord Bot & Canvas Customizer

On-demand domain invariants activated when `GEMINI.md §2.3` or `resources/stacks/_stack-composer.md` detects a Discord bot control center, plugin customizer, or OpenType canvas compositor.

---

## 1. Hard Domain Invariants
1. **3,000ms Discord Interaction SLA**: Never perform DB queries, HTTP calls, or Sharp/Canvas rendering prior to `deferReply()` / `deferEdit()`.
2. **DM Plain-Text Mentions**: Direct message templates MUST render plain-text `{roleName}` instead of `<@&role_id>` snowflakes.
3. **Component V2 Nesting**: Interactive controls MUST remain nested inside `ActionRow` containers.
4. **Central Registry Canonicalization**: Fetch assets/emojis exclusively via the central application client registry.
5. **Customiser Route Guard & `/plugins` Fallback**: Disabled customiser APIs return HTTP `403`; disabled UI views redirect to `/plugins`; enabled `Customise` buttons deep-link directly (never looping back to `/plugins`).
6. **Sandboxed `DATA_DIR` Assets**: Resolve customizer assets strictly via canonical web routes (`/api/welcomer/asset?name=...`) backed by `DATA_DIR`, never host filesystem paths.
7. **Canvas & OpenType Parity**: Selected canvas elements render `#E92738` crimson borders with 4 corner grips; compositor output renders glyphs via `opentype.js` Bezier `<path d="...">` within `<= 2px` parity and buffer size `> 50KB`, luminance std-dev `> 15.0`.
