# Critical Rules: Next.js (Pages Router Dialect)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Next.js with the classic Pages Router (`src/pages/`).

---

## 1. Scope & Target Stack
- **Framework**: Next.js 14.x / 15.x / 16.x (Pages Router)
- **Language**: TypeScript 5.4+ (Strict Mode)
- **Runtime**: Node.js 22+ / 24+ LTS
- **Applicable Files**: `src/pages/**/*.tsx`, `src/pages/api/**/*.ts`, `pages/**/*.tsx`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-NEXT-PAGES-01: Pages Router Isolation (No Routing Mixing)
- 100% of routes MUST reside in `src/pages/` (or `pages/`).
- Introduction of `src/app/` in a Pages Router project is strictly FORBIDDEN. Mixed router structures cause undefined routing collisions and hydration bugs.

### RULE-NEXT-PAGES-02: Global Context & Layout Architecture
- Global context providers (Telemetry, Auth, Themes, QueryClient) MUST be declared in `src/pages/_app.tsx`.
- Modifying `_app.tsx` or shared layout shells (`components/DashboardShell.tsx`) to supply state required by page views is classified as **Mandatory State Infrastructure** (RULE-ENG-02) and is explicitly permitted.

### RULE-NEXT-PAGES-03: SSR Hydration Mismatch Defense
- Components accessing browser APIs (`localStorage`, `window.matchMedia`, `document`) MUST execute such calls within `useEffect` or behind a mounted state guard (`const [mounted, setMounted] = useState(false)`).
- Direct access to browser globals during initial component render is treated as a critical defect.

### RULE-NEXT-PAGES-04: Closed Vertical Slices for API Routes
- All interactive UI forms and action buttons MUST terminate in concrete API handlers in `src/pages/api/` or typed external clients.
- Banning AP-001: Disguising incomplete mutations under "Local Demo" or "Preview" badges is strictly prohibited.

### RULE-NEXT-PAGES-05: Temporal State & Polling Testing
- If components employ recurring polling intervals (`setInterval`, SWR, React Query polling), S7 automated tests MUST advance timers across $\ge 2$ intervals using `vi.useFakeTimers()` to verify that user input in dirty forms is never wiped out by background refreshes.
