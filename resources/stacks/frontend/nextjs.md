# Stack Pack: Next.js & React 19 (App Router)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for web frontend and fullstack applications built with Next.js App Router, React 19, and TypeScript.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Next.js | 15.0.0+ / 16.0.0+ | App Router architecture (`src/app/`) | Pages Router (`pages/`), Next.js < 15 |
| React | 19.0.0+ | Server Components, Actions, `useActionState` | React 18 legacy hooks |
| TypeScript | 5.5.0+ | Strict type checking (`strict: true`) | Unchecked JavaScript, TypeScript < 5.0 |
| Styling | Tailwind CSS 3.4+ / 4.0 | Utility-first styling with design tokens | Unmanaged legacy CSS stylesheets |
| Node.js | Node.js 22 LTS / 26 LTS | Node.js Active/Maintenance LTS | Node.js < 22 (Node 20 EOL) |

## 2. Architecture Rules
These rules define the structural boundaries, rendering safety, state synchronization, and accessibility governance for Next.js applications.

- **100% App Router & Collision Avoidance**: All routing MUST reside exclusively inside `src/app/`. Coexistence of root `app/` and `src/app/`, or mixing `pages/` with `src/app/`, is strictly FORBIDDEN because it triggers severe build-time route collisions.
- **Server Components (RSC) Default & Leaf Client Boundaries**: All components are React Server Components by default. The `'use client'` directive MUST only be placed at leaf component nodes requiring browser interactivity (event listeners, browser hooks like `useState`, `useEffect`). Never declare `'use client'` at layout or page root levels unless strictly required.
- **Mandatory Two-File Route Pair (`layout.tsx` + `page.tsx`)**: Every route directory under `src/app/` MUST provide both `layout.tsx` (defining RSC metadata, layout boundaries, and error boundaries) and `page.tsx` (rendering the view). Omitting either file breaks route hierarchy.
- **1:1 Route Mirroring & Component Decomposition Ceiling**: Route-specific components and API wrappers MUST mirror the route path: components live in `src/components/<route>/`, and API calls live in `src/lib/api/<route>/`. Every `.tsx` file MUST define at most 1 primary component with at most 2 inline helper elements.
- **Server Actions Security & Validation**: Server Actions (`'use server'`) MUST validate all input arguments using a schema validator (Zod, Valibot), verify user authentication and authorization permissions, and return typed result objects (`{ success: boolean, data?: T, error?: string }`). Throwing unhandled exceptions across server action boundaries is prohibited.
- **Client-Side Secret Exposure Ban**: Environment variables carrying bot tokens, private API keys, signing secrets, or database URLs MUST NEVER be prefixed with `NEXT_PUBLIC_`. Client bundles must only receive public API URLs and feature flags.
- **Dirty State & Unsaved Changes Synchronization**: Form fields, property editors, and state mutations MUST synchronize with a global `isDirty` state tracker, docking a persistent `UnsavedChangesBar` to prevent accidental navigation loss.
- **Atomic Token Refresh Mutex Queue**: When API requests receive 401 Unauthorized, client interceptors MUST execute an atomic `isRefreshing` mutex lock with a queued request replay mechanism, preventing token race conditions from concurrent calls.
- **WCAG 2.2 AA Accessibility & Reduced Motion**: Interactive controls MUST meet a minimum 44px $\times$ 44px touch target size on mobile/touch viewports, with high-contrast `:focus-visible` rings. Animation libraries (Framer Motion) MUST respect user OS preferences via `<MotionConfig reducedMotion="user">`.
- **Mandatory Runtime E2E / Component Smoke Gate (S7-B Gate)**: Running static `npx tsc --noEmit` or unit tests with shallow mocks alone CANNOT satisfy S7 verification. Any changes modifying UI forms, Server Actions, or interactive components MUST execute an automated Playwright or Component smoke test certifying real DOM rendering, form input, state persistence, and HTTP communication.

## 3. Common Anti-Patterns

#### AP-NEXT-01: Static Typing Illusion (`npx tsc --noEmit` as Only Test)
**What it is**: Claiming frontend feature completion when only `tsc --noEmit` has been executed.
**Detection signal**: `task.md` or test records showing only `npx tsc --noEmit` without automated component or browser interaction tests.
**Consequence**: Broken forms, mismatched REST endpoints, unhandled submit errors, and phantom local state bugs slip into production unnoticed.
**Correct alternative**: Execute automated component tests or Playwright E2E smoke tests verifying actual DOM interaction and API persistence.

#### AP-NEXT-02: Secret Exposure via `NEXT_PUBLIC_`
**What it is**: Prefixing private credentials or API keys with `NEXT_PUBLIC_`.
**Detection signal**: `NEXT_PUBLIC_DISCORD_BOT_TOKEN`, `NEXT_PUBLIC_JWT_SECRET`, or `NEXT_PUBLIC_DB_PASS` in `.env` files.
**Consequence**: Next.js bakes these variables into public client-side JavaScript bundles, exposing secrets to any website visitor.
**Correct alternative**: Remove the `NEXT_PUBLIC_` prefix and keep secrets strictly encapsulated in backend configurations or server runtime environments.

#### AP-NEXT-03: Route File Sprawl & Arbitrary CSS Stylesheets
**What it is**: Dumping multiple monolithic components into a single file, or importing ad-hoc `.css` files.
**Detection signal**: `.tsx` files exceeding 250 lines with multiple exported components, or custom `.css` stylesheets outside global tokens.
**Consequence**: Causes CSS specificity clashes, inflates bundle size, breaks dark mode tokens, and degrades maintainability.
**Correct alternative**: Decompose into separate single-component files and author styles exclusively with Tailwind utility classes.

## 4. Audit Checklist
- [ ] Routes strictly reside under `src/app/` with 1:1 mirrored `src/components/<route>/` folders.
- [ ] Every route provides both `layout.tsx` and `page.tsx`.
- [ ] Server Actions validate inputs with Zod and verify authorization.
- [ ] No private secrets are prefixed with `NEXT_PUBLIC_`.
- [ ] Mutex queue protects concurrent token refresh calls on 401 responses.
- [ ] Interactive controls meet 44px $\times$ 44px touch target minimum and support reduced motion.
- [ ] Real automated browser or component smoke test passes green (S7-B Gate).

## 5. Useful References
- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [React 19 Server Actions & Components](https://react.dev/reference/rsc/server-components)
- [WCAG 2.2 Target Size (Minimum) Standards](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
