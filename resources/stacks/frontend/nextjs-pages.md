# Technology Stack: Next.js (Pages Router) & React

## 1. Core Stack & Pinned LTS Versions (October 2026 LTS Baseline)
- **Framework**: Next.js 15+ / 16+ (Pages Router Dialect)
- **UI Library**: React 19 LTS (Client-side rendering & SSR lifecycle)
- **Language**: TypeScript 5.4+ (Strict Mode)
- **Runtime**: Node.js 24 / 26 Active LTS
- **Styling**: Tailwind CSS 4.0+ or CSS Modules
- **Testing**: Vitest / React Testing Library / Playwright

## 2. Directory & Architectural Conventions
```text
src/
├── pages/
│   ├── _app.tsx          # Global Shell, Providers (Theme, Auth, Telemetry), Global CSS
│   ├── _document.tsx     # Custom HTML Document, Meta tags, Web Fonts
│   ├── api/              # Node.js API Route Handlers (NextApiRequest, NextApiResponse)
│   │   └── health.ts
│   ├── index.tsx         # Root / Landing page
│   └── [feature].tsx     # Feature route views
├── components/           # Reusable presentational & layout components
│   └── DashboardShell.tsx# Layout shell wrapping page bodies
├── context/              # React Context Providers (TelemetryContext, ThemeContext)
├── hooks/                # Custom React hooks (useInterval, useDirtyForm)
└── lib/                  # Shared utilities, API client instances, DTOs
```

## 3. Mandatory Engineering Invariants
1. **Pages Router Exclusivity**: 100% of routes reside in `src/pages/` (or `pages/`). Coexisting `app/` is strictly forbidden to prevent route collisions.
2. **Provider Rooting in `_app.tsx`**: All global state providers (telemetry, authentication, notifications, themes) MUST be mounted in `_app.tsx`. Never re-instantiate root providers inside individual page files.
3. **Hydration Safety**: Access to `window`, `localStorage`, or browser navigator APIs MUST be guarded by `useEffect()` or `typeof window !== 'undefined'` checks to prevent SSR hydration mismatches.
4. **Typed API Routes**: All API handlers in `pages/api/` must explicitly type request and response parameters using `NextApiRequest` and `NextApiResponse<T>`.
5. **No Solo Typechecking**: Passing `tsc --noEmit` alone does not certify S7 release readiness. Real component mount tests and API route handler tests must execute and pass.
