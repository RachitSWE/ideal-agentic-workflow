# Runtime Smoke Test Templates (S7-B & S7-D Verification Gate)

This directory provides standardized, production-grade smoke test recipes designed to satisfy the **S7-B Runtime Smoke Verification Gate** and **S7-D Headless Geometry & Quality Gate** across all supported tech stacks.

## The Principle: Zero-Mock Runtime Verification & Mechanical Quality
Mocks hide runtime wiring mismatches, missing dependency injection beans, broken SQL migrations, dynamic linker crashes (`ERR_DLOPEN_FAILED`), containing-block traps (`will-change: transform`), and 8KB pitch-black image voids.
Every smoke test in this directory boots the **real runtime context**, tests **real headless DOM geometry**, or computes **pixel entropy metrics**, proving operational viability before code moves to S8 Code Review.

## Available Templates

| Category / Stack | File | Runtime Invariant Enforced | Remediated Defect |
| :--- | :--- | :--- | :--- |
| **Java / Spring Boot 3+** | [`springboot-smoke.java`](springboot-smoke.java) | Real `@SpringBootTest(webEnvironment = RANDOM_PORT)`, Datasource Hikari ping, `/actuator/health` probe. | Context load failure |
| **Python / FastAPI 0.115+** | [`fastapi-lifespan-smoke.py`](fastapi-lifespan-smoke.py) | Async `lifespan` context boot, database connection pool validation, `/health` response. | Async loop crash |
| **Next.js 16+ / React 19** | [`nextjs-smoke.spec.ts`](nextjs-smoke.spec.ts) | Real DOM mount test without mock fallback, route handler `/api/health` status 200. | AP-NEXT-06 local mocks |
| **Rust / Axum 0.8+ / Tokio** | [`rust-axum-smoke.rs`](rust-axum-smoke.rs) | Ephemeral socket bind (`0.0.0.0:0`), Axum router assembly, HTTP GET `/health` status check. | Async Tokio panic |
| **Angular 21+ LTS** | [`angular-smoke.spec.ts`](angular-smoke.spec.ts) | Standalone root component mounting, zoneless change detection trigger, router outlet assertion. | Zoneless change detection |
| **Headless Geometry & Touch** | [`headless-geometry-smoke.spec.ts`](headless-geometry-smoke.spec.ts) | Playwright viewport scroll clamping, 1:1 circular avatar geometry, modal breakout, mobile touch scroll. | BUG-001, BUG-010, BUG-012, BUG-017, BUG-022 |
| **Process Survival & Lifecycle**| [`process-lifecycle-smoke.ts`](process-lifecycle-smoke.ts) | Unmocked subprocess health probe ($\ge 3$s survival), fake timer status polling race simulation. | BUG-002, BUG-004, BUG-005 |
| **Image Compositor & Buffer Entropy**| [`image-buffer-quality-smoke.ts`](image-buffer-quality-smoke.ts) | Sharp buffer byte budget ($>50\text{KB}$), pixel luminance standard deviation ($>15.0$), Opentype Bezier curves, grid contrast. | BUG-011, BUG-013, BUG-015, BUG-018, BUG-019, BUG-020 |
| **Shared Coordinate Parity**| [`coordinate-parity-smoke.ts`](coordinate-parity-smoke.ts) | Shared mathematical coordinate parity ($\le 2\text{px}$ delta between web DOM and Sharp compositor offsets). | BUG-023 |

## How Subagents Adapt These Templates
1. **S6 Implementation Phase**: Copy the relevant template to the project's test directory (e.g. `tests/smoke/` or `src/test/java/.../SmokeTest.java`).
2. **S7 Automated Testing Phase**: Run the corresponding Tier 3B/3D test command defined in `skills/s7-testing/resources/test-commands.md`.
3. **S8 Code Review Phase**: Reviewers verify the terminal output logs to confirm that real processes, layout geometries, and pixel buffers passed verification with exit code 0.
