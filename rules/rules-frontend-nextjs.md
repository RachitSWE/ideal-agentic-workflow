# Critical Rules: Next.js & React 19 (App Router)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Next.js App Router, React 19, and TypeScript.

---

## 1. Scope & Target Stack
- **Framework**: Next.js 15.0+ / 16.0+ App Router (`src/app/`)
- **UI Library**: React 19.0+ (Server Components & Server Actions)
- **Language**: TypeScript 5.3+ (Strict Mode)
- **Runtime**: Node.js 22 LTS
- **Applicable Files**: `src/app/**/*.tsx`, `src/components/**/*.tsx`, `src/lib/api/**/*.ts`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-NEXT-01: 100% App Router & Collision Avoidance
- All routing MUST reside exclusively inside `src/app/`.
- Root `app/` and `src/app/` MUST NEVER coexist in the repository. Mixing legacy `pages/` with `src/app/` is strictly FORBIDDEN.

### RULE-NEXT-02: Server Components (RSC) Default & Leaf Client Boundaries
- All files in `src/app/` default to React Server Components without `'use client'`.
- The `'use client'` directive MUST be restricted exclusively to interactive leaf nodes (event listeners, browser hooks). High-level layouts (`layout.tsx`), pages (`page.tsx`), and data containers must never declare `'use client'`.
- Server Components must be passed as `children` or JSX slots to Client Components; direct imports of Server Components into Client Components are strictly forbidden.

### RULE-NEXT-03: Mandatory Two-File Route Pair (`layout.tsx` + `page.tsx`)
- Every route folder under `src/app/` MUST strictly provide both `layout.tsx` (defining metadata and boundary shells) and `page.tsx` (rendering the view).

### RULE-NEXT-04: 1:1 Route Mirroring & Component Decomposition Ceiling
- Every route under `src/app/<route>/` must have its route-specific UI mirrored under `src/components/<route>/` and its route-specific API calls mirrored under `src/lib/api/<route>/`.
- Every `.tsx` file MUST define at most 1 primary component with at most 2 inline helper elements. Monolithic component files exceeding 250 lines are forbidden.

### RULE-NEXT-05: Server Actions Security & Input Validation
- Server Actions (`'use server'`) MUST NOT trust client payloads. All inputs MUST be validated using a schema validator (Zod or Valibot), and caller authentication and authorization must be verified before executing mutations.
- Server Actions must return typed action result objects (`ActionState<T>`) rather than throwing unhandled exceptions.

### RULE-NEXT-06: Client-Side Secret Exposure Ban
- Environment variables containing private API tokens, signing secrets, or database URLs MUST NEVER be prefixed with `NEXT_PUBLIC_`.
- Server utilities and database modules MUST declare `import 'server-only'` to guarantee compile-time protection against accidental client bundling.

### RULE-NEXT-07: Asynchronous Request APIs in Next.js 15+
- Next.js treats `cookies()`, `headers()`, and route `params` as asynchronous Promises. Accessing them synchronously without `await` is strictly FORBIDDEN.

### RULE-NEXT-08: Atomic Token Refresh Mutex Queue
- HTTP API clients MUST implement a mutex queue for concurrent 401 Unauthorized responses. The first 401 locks the mutex and triggers a single refresh; concurrent requests are queued and replayed upon successful token issuance, preventing token rotation race conditions.

### RULE-NEXT-09: Dirty State & Unsaved Changes Synchronization
- Form mutations and configuration edits MUST synchronize with an `isDirty` state tracker, docking a persistent `UnsavedChangesBar` to protect users against accidental navigation or reload data loss.

### RULE-NEXT-10: WCAG 2.2 AA Accessibility & Reduced Motion
- All interactive controls MUST maintain a minimum 44px $\times$ 44px touch target on mobile viewports.
- Keyboard focus indicators MUST use high-contrast `:focus-visible` rings ($3:1$ contrast ratio). Animations must respect `prefers-reduced-motion: reduce`.

### RULE-NEXT-11: Mandatory Runtime E2E / Component Smoke Gate (S7-B Gate)
- Running static `npx tsc --noEmit` alone CANNOT satisfy S7 verification. Any changes modifying UI forms, Server Actions, or routing MUST pass an automated Playwright or Component smoke test asserting real DOM rendering, form interaction, and API persistence.
