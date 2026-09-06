# Stack Pack: Next.js + Turborepo

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Next.js, React, and Turborepo. An auditor MUST verify that all `package.json` files within the monorepo strictly comply with these ranges to prevent build failures and hydration mismatches. Ensuring that all workspaces share the same React version is critical for monorepo stability.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Next.js | 14.0.0 | React 18+, Node.js 18.17+ | React < 18 |
| Turborepo | 1.11.0 | `turbo.json` config | Workspaces without explicit boundaries |
| TypeScript | 5.0.0 | `@types/react`, `@types/node` | `strict: false` in `tsconfig.json` |

## 2. Architecture Rules
These rules define the structural boundaries of a Next.js App Router application within a Turborepo monorepo. The codebase MUST adhere strictly to these constraints to ensure correct hydration, rendering, and package isolation. Adhering to these rules prevents silent failures during static site generation and edge deployments.

- **App Router Exclusivity**: The application MUST exclusively use the App Router (`app/` directory). The Pages Router (`pages/`) MUST NOT be used alongside the App Router to prevent duplicate rendering paths and context confusion.
- **Turborepo Boundaries**: Code inside the `packages/` directory MUST NOT import anything from the `apps/` directory. Packages are independent libraries; apps consume packages, never the reverse.
- **Server and Client Directives**: Server components MUST NOT import browser-only APIs (`window`) or React hooks (`useState`). Client components MUST include the `'use client'` directive at the top. The `'use server'` directive MUST only be used at the top of a file containing server actions or inside an async function intended to be a server action; it MUST NOT be used as a general marker for server-side components.
- **TypeScript Strictness**: All `tsconfig.json` files MUST have `"strict": true` enabled. Use of `any` types in production code is prohibited.
- **Image Optimization**: The application MUST use `next/image` (`<Image />`) for all static and external images. Raw HTML `<img>` tags MUST NOT be used unless explicitly required for SVG svgr rendering or external embeds where `next/image` is unsupported.

## 3. Common Anti-Patterns
The following anti-patterns represent the most frequent sources of performance degradation and architectural debt in Next.js applications. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent them from reaching production.

#### AP-NEXT-01: Improper Mixing of Server and Client Code
**What it is**: Passing a Server Component as a direct import into a Client Component instead of passing it as a `children` prop.
**Detection signal**: A file with `'use client'` at the top imports a component that performs server-side data fetching or uses Node.js APIs (like `fs`).
**Consequence**: The server component is forced to render on the client, exposing server-side code to the browser and increasing bundle size, or causing a runtime crash.
**Correct alternative**: Pass the server component as a React child: `<ClientWrapper><ServerComponent /></ClientWrapper>`.

#### AP-NEXT-02: Dynamic Routes Without Static Params
**What it is**: Creating dynamic routes (e.g., `[id]/page.tsx`) in a statically exported or highly cached site without providing `generateStaticParams`.
**Detection signal**: A dynamic route file `app/[slug]/page.tsx` exists, but there is no exported `generateStaticParams` function in that file.
**Consequence**: Next.js must render these pages on-demand at runtime, causing slow TTFB (Time to First Byte) and missing out on edge CDN caching.
**Correct alternative**: Export an async `generateStaticParams` function that returns an array of route parameters.

#### AP-NEXT-03: Heavy Third-Party Imports
**What it is**: Importing large, monolithic libraries (like `lodash` or `moment`) entirely into client bundles instead of using lighter alternatives or modular imports.
**Detection signal**: `import _ from 'lodash'` instead of `import get from 'lodash/get'`, or importing `moment` instead of `date-fns`.
**Consequence**: The client bundle size swells unnecessarily, leading to slow page loads and poor Core Web Vitals.
**Correct alternative**: Use modular imports (`lodash/get`), switch to modern lighter libraries (`date-fns`), or rely on native JavaScript APIs.

#### AP-NEXT-04: Broad Middleware Matchers
**What it is**: Configuring the Next.js middleware `matcher` array too broadly (e.g., matching all routes) without excluding static files or images.
**Detection signal**: A `middleware.ts` file contains a `matcher` config like `matcher: ['/:path*']` without negative lookaheads for `_next/static`, `_next/image`, and `favicon.ico`.
**Consequence**: The middleware executes on every static asset request, heavily degrading performance and increasing server costs.
**Correct alternative**: Use negative lookaheads in the matcher regex: `matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']`.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a Next.js + Turborepo codebase. Failure to check these items may result in severe performance issues, architectural violations, or broken builds.
- [ ] No files exist in a `pages/` directory if `app/` is being used for routing.
- [ ] No `packages/` workspace imports anything from an `apps/` workspace.
- [ ] `'use client'` is only used at the leaves of the component tree, not at the root layout.
- [ ] `'use server'` is only used for server actions, not as a component marker.
- [ ] `generateStaticParams` is implemented for dynamic routes where applicable.
- [ ] Middleware `matcher` configuration explicitly excludes static assets.
- [ ] All images use `next/image` rather than `<img>`.
- [ ] `tsconfig.json` has `"strict": true`.

## 5. Useful References
The following resources provide authoritative guidance on building scalable applications with Next.js and Turborepo. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions or when configuring advanced build caching features. Keeping up to date with these official resources ensures that the codebase does not adopt deprecated patterns or community-driven workarounds that are no longer necessary.
- [Next.js App Router Documentation](https://nextjs.org/docs/app): The primary source of truth for App Router paradigms, routing, and data fetching.
- [Turborepo Documentation](https://turbo.build/repo/docs): Guidelines for monorepo boundary configuration, caching, and task orchestration.
- [Next.js Middleware Constraints](https://nextjs.org/docs/app/building-your-application/routing/middleware): Details on Edge Runtime limitations and matcher configurations.
- [React Server Components](https://react.dev/reference/rsc/server-components): Understanding the mental model of RSCs and the serialization boundaries between server and client.
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations): Best practices for securing and executing mutations on the server.
