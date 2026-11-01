# Critical Rules: Angular (Signals & Zoneless)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Angular 20+ LTS, Signals, and standalone architectures.

---

## 1. Scope & Target Stack
- **Framework**: Angular 20.0+ / 21.0+ LTS (Recommended 22+)
- **Language**: TypeScript 5.4+ (Strict Mode)
- **Runtime**: Node.js 22 LTS
- **Applicable Files**: `src/app/**/*.ts`, `src/app/**/*.html`, `angular.json`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-ANG-01: Standalone Components Mandate (Zero `NgModule`)
- 100% of components, directives, and pipes MUST be declared as standalone (`standalone: true`).
- Legacy `NgModule` declarations are strictly PROHIBITED in modern codebases.

### RULE-ANG-02: Signals-First Reactive State Management
- Component state MUST be managed using Angular Signals (`signal()`, `computed()`, `linkedSignal()`, `resource()`).
- Inputs MUST use Signal Inputs (`input()`, `input.required()`), two-way bindings MUST use Model Signals (`model()`), and outputs MUST use Signal Outputs (`output()`).
- `computed()` signals MUST be pure, deterministic, and idempotent. Writing to signals inside `computed()` is forbidden.

### RULE-ANG-03: Zoneless Change Detection & `OnPush` Strategy
- Applications MUST bootstrap zoneless change detection via `provideExperimentalZonelessChangeDetection()` in `app.config.ts`, and `zone.js` MUST be removed from `angular.json` polyfills.
- Where zone compatibility is required, all components MUST explicitly declare `changeDetection: ChangeDetectionStrategy.OnPush`.

### RULE-ANG-04: Modern Native Control Flow Syntax
- Templates MUST use modern block syntax (`@if`, `@else`, `@for`, `@switch`, `@case`). Legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) are strictly FORBIDDEN.
- Every `@for` loop MUST declare a unique item identifier (`track item.id`). Tracking by `$index` on dynamic/mutable lists is prohibited.

### RULE-ANG-05: Functional Dependency Injection via `inject()`
- Services, router parameters, and configuration tokens MUST be injected using the functional `inject()` API at field initialization. Legacy constructor parameter injection is prohibited.

### RULE-ANG-06: RxJS Hygiene & Subscription Leak Elimination
- Manual `.subscribe()` invocations without destruction lifecycle bounds are strictly PROHIBITED.
- Observables consumed in templates MUST be converted to signals using `toSignal()` or piped through `takeUntilDestroyed()`.

### RULE-ANG-07: WCAG 2.2 AA Accessibility & Touch Targets
- Interactive buttons and controls MUST maintain a minimum 44px $\times$ 44px touch target on touch viewports and provide high-contrast `:focus-visible` outline rings. Animations MUST respect `prefers-reduced-motion`.

### RULE-ANG-08: Mandatory Runtime Component / E2E Smoke Gate (S7-B Gate)
- Running static `ng lint` or `tsc` alone CANNOT satisfy S7 verification. Any changes modifying UI forms, routing, or interactive components MUST execute an automated Playwright, Cypress, or Angular Component Harness smoke test asserting real DOM rendering, event handling, and data binding.
