# Critical Rules: Next.js + Turborepo + React Server Components

This document defines the strict, non-negotiable architectural rules and invariants for projects using Next.js App Router, React 19, TypeScript, and Turborepo monorepos.

---

## 1. Scope & Target Stack
- **Framework**: Next.js 14+ / 15+ (App Router exclusively)
- **Monorepo Engine**: Turborepo 1.11+ / 2.x
- **Applicable Files**: `apps/*/app/**/*.tsx`, `packages/**/*.ts*`, `turbo.json`, `tsconfig.json`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-NEXT-01: App Router Exclusivity
- The codebase MUST exclusively use the App Router (`app/` directory).
- Mixing `pages/` and `app/` routers in the same application is strictly FORBIDDEN.

### RULE-NEXT-02: Server Component by Default
- All components in the `app/` directory are React Server Components (RSC) by default.
- Adding `'use client'` to root layouts, page templates, or container components is strictly FORBIDDEN.
- `'use client'` MUST only be pushed down to the leaves of the component tree where interactivity (`useState`, `useEffect`, `onClick`) is strictly necessary.
- Pass Server Components into Client Components via the `children` prop pattern:
  `<ClientModal><ServerFeed /></ClientModal>`

### RULE-NEXT-03: Server Actions Security & Input Validation
- Any Server Action marked with `'use server'` MUST authenticate the caller and validate all inputs with Zod (or equivalent schema parser) before touching databases or business logic.
- Never trust raw client arguments passed to a Server Action.

### RULE-NEXT-04: Strict Monorepo Boundaries
- Packages in `packages/` MUST NEVER import from `apps/`.
- Relative imports crossing package or app boundaries (e.g., `../../packages/ui`) are FORBIDDEN. All inter-package dependencies MUST use configured workspace aliases (e.g., `@repo/ui`, `@repo/db`).

### RULE-NEXT-05: Direct Data Fetching (No Self-HTTP Fetching)
- Server Components MUST call internal service functions or ORMs directly.
- NEVER execute an HTTP `fetch('https://localhost/api/...')` from a Server Component to fetch data from an internal Route Handler.

### RULE-NEXT-06: Strict Middleware Matchers
- `middleware.ts` matchers MUST explicitly exclude static assets, images, and favicons using negative lookaheads:
  ```ts
  export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  };
  ```

### RULE-NEXT-07: Static Parameter Export for Dynamic Routes
- Statically rendered dynamic routes (`app/[slug]/page.tsx`) MUST export `generateStaticParams` to enable build-time prerendering and edge caching.

### RULE-NEXT-08: Zero Raw `<img>` Tags
- Image rendering MUST use Next.js `<Image />` (`next/image`) with explicit dimensions or fill layout for automatic layout shift prevention and modern WebP/AVIF compression.
