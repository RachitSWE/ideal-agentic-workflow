# Stack Pack: Angular 18/19 (Signals & Zoneless)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for modern Angular single-page applications built on Signals, Zoneless change detection, and standalone architectures.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Angular Core & CLI | 20.0.0+ LTS (Recommended 21/22) | `@angular/core`, `@angular/router`, `@angular/common` | Angular <= 19 (EOL May 2026), Legacy NgModule |
| TypeScript | 5.5.0+ | Strict type checking (`strict: true`) | TypeScript < 5.4 |
| Reactive Primitives | Angular Signals / RxJS 7.8+ | `@angular/core/rxjs-interop` | Unmanaged manual RxJS subscriptions |
| Node.js | Node.js 22 LTS / 26 LTS | Modern package manager (pnpm, npm) | Node.js < 22 (Node 20 EOL) |

## 2. Architecture Rules
These rules define the reactivity models, change detection boundaries, component modularity, and accessibility governance for Angular applications.

- **Standalone Components Mandate (Zero `NgModule`)**: 100% of components, directives, and pipes MUST be declared as standalone (`standalone: true` or default in v19+). Monolithic `NgModule` declarations are strictly FORBIDDEN in new and refactored code.
- **Signals-First State Management**: Reactive component state MUST be managed using Angular Signals (`signal()`, `computed()`, `effect()`). Input properties MUST use Signal Inputs (`input()`, `input.required()`), two-way bindings MUST use Model Signals (`model()`), and events MUST use Signal Outputs (`output()`).
- **Zoneless & `OnPush` Change Detection**: Applications MUST be architected to support zoneless operation via `provideExperimentalZonelessChangeDetection()` in application bootstrap, or enforce `ChangeDetectionStrategy.OnPush` across all components. Relying on implicit Zone.js dirty-checking cycles is prohibited.
- **Modern Built-in Control Flow Syntax**: Templates MUST use modern block syntax (`@if`, `@else`, `@for`, `@empty`, `@switch`, `@case`). Legacy structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) are strictly deprecated and prohibited.
- **Functional Dependency Injection via `inject()`**: Services, router parameters, and configuration tokens MUST be injected using the functional `inject()` API at field declaration level rather than cumbersome constructor parameter injection.
- **RxJS Subscription Leak Prevention**: Any remaining RxJS Observables consumed in components MUST be converted to signals using `toSignal()`, or piped through `takeUntilDestroyed(this.destroyRef)`. Unmanaged manual `.subscribe()` calls without destruction lifecycle cleanup are strictly FORBIDDEN.
- **Accessibility & Touch Targets (WCAG 2.2 AA)**: All interactive buttons and form controls MUST maintain a minimum 44px $\times$ 44px touch target on touch viewports and provide high-contrast `:focus-visible` outline rings. Animations MUST respect `prefers-reduced-motion`.
- **Mandatory Runtime Component / E2E Smoke Gate (S7-B Gate)**: Running static `ng lint` or `tsc` alone CANNOT satisfy S7 verification. Any changes modifying forms, routing, or interactive UI components MUST execute an automated Playwright, Cypress, or Angular Component Harness smoke test asserting real DOM rendering, event handling, and data binding.

## 3. Common Anti-Patterns

#### AP-ANG-01: Memory Leaks from Unmanaged RxJS Subscriptions
**What it is**: Calling `.subscribe()` on Observables in components without unsubscribing on component destruction.
**Detection signal**: Bare `.subscribe(...)` calls without `takeUntilDestroyed()`, `takeUntil()`, or `async` pipe.
**Consequence**: Subscribed callbacks continue executing after the component unmounts, leaking memory and triggering phantom state updates.
**Correct alternative**: Convert to signals via `toSignal(observable$)` or chain `.pipe(takeUntilDestroyed())`.

#### AP-ANG-02: Legacy Structural Directives (`*ngIf`, `*ngFor`)
**What it is**: Authoring templates using deprecated `*ngIf` and `*ngFor` directives instead of modern `@if` and `@for`.
**Detection signal**: Templates containing `*ngIf="condition"` or `*ngFor="let item of items"`.
**Consequence**: Misses compiler optimizations, lacks empty-state `@empty` handling, and increases template parsing overhead.
**Correct alternative**: Adopt modern block syntax: `@if (condition) { ... }` and `@for (item of items; track item.id) { ... } @empty { ... }`.

#### AP-ANG-03: Constructor Injection Boilerplate
**What it is**: Cluttering component constructors with long lists of injected service parameters.
**Detection signal**: Multi-line constructor signatures with `constructor(private authService: AuthService, ...)`.
**Consequence**: Complicates component inheritance, makes test mocking verbose, and violates modern Angular style guidelines.
**Correct alternative**: Use field-level functional injection: `private readonly authService = inject(AuthService);`.

## 4. Audit Checklist
- [ ] 100% of components are standalone; zero `NgModule` declarations present.
- [ ] Templates use `@if`, `@for`, and `@switch` modern control flow blocks.
- [ ] Reactive state leverages Signals (`signal`, `computed`, `input`, `output`).
- [ ] Components enforce `ChangeDetectionStrategy.OnPush` or zoneless providers.
- [ ] Subscriptions use `takeUntilDestroyed()` or `toSignal()` to prevent memory leaks.
- [ ] Services are injected via functional `inject()` syntax.
- [ ] Real component or E2E smoke test passes green (S7-B Gate).

## 5. Useful References
- [Angular Official Documentation](https://angular.dev/)
- [Angular Signals Developer Guide](https://angular.dev/guide/signals)
- [Angular Control Flow Syntax Guide](https://angular.dev/guide/templates/control-flow)
- [Zoneless Angular Overview](https://angular.dev/guide/experimental/zoneless)
