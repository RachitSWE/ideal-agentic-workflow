# Stack Pack: Discord Bot Control Center & Canvas Customizer

Opt-in domain pack for repositories combining a Discord bot gateway (`discord.js`, JDA, Discord Interactions) with a web configuration dashboard or headless image/canvas compositor (`opentype.js`, Sharp, `@napi-rs/canvas`).

---

## 1. Discord Gateway & Interaction Standards
- **3,000ms Interaction SLA**: All slash commands, button interactions, and select menu handlers MUST acknowledge interactions via `deferReply()` or `deferEdit()` before executing database lookups, external HTTP calls, or heavyweight image compositing.
- **DM Context Mention Discipline**: Direct messages lack guild role caches; guild role snowflakes (`<@&role_id>`) render as `@unknown-role`. DM templates MUST resolve plain-text `{roleName}` tokens.
- **Component V2 Nesting**: Interactive buttons and select menus MUST reside inside valid `ActionRow` container bounds.
- **Central Registry Canonicalization**: Resolve guild assets and application emojis exclusively through the centralized application client registry rather than hardcoded guild-scoped strings.

## 2. Plugin & Customizer Route Integrity
- **Fail-Closed Module Gating**: Disabled plugin/customizer API routes MUST return HTTP `403 Forbidden`; client route guards MUST redirect disabled customizer views back to `/plugins`.
- **Deep-Link Navigation Integrity**: Customiser buttons on enabled modules MUST route directly to the module's customizer view (`/customiser/[plugin]`) rather than looping back to `/plugins`.
- **Web Asset Sandboxing**: Serve customizer background images and font assets through canonical web endpoints (e.g. `/api/welcomer/asset?name=...`) resolved against `DATA_DIR`—never leak host filesystem paths (`file:///`, `/storage/emulated/0/`, `C:\Users`).

## 3. Canvas Selection & Headless Image Compositor Parity
- **Visual Selection Affordances**: Active draggable canvas elements MUST expose `#E92738` selection borders with 4 corner resize/drag grips, and background alignment grids MUST maintain at least `3:1` contrast.
- **Single-Source OpenType Compositor**: Headless Node/Sharp/Canvas image rendering pipelines MUST convert typographical glyphs to mathematical SVG Bezier curves (`<path d="...">`) via `opentype.js` and keep server-rendered bounding boxes within `<= 2px` of browser canvas coordinates.
- **Mechanical Buffer Entropy Gate**: Generated composite image buffers MUST pass automated smoke assertions requiring byte size `> 50KB` and luminance standard deviation `> 15.0` to catch blank-frame or black-void regressions.

## 4. Verification Profile
- Run Tier 2 route scanner with domain profile active: `node scripts/check-route-integrity.mjs --profile discord-bot-customizer`
- Enforce rules in [`resources/stack-rules/rules-discord-bot-customizer.md`](../stack-rules/rules-discord-bot-customizer.md).
