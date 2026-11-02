# Runtime Smoke Test Templates (S7-B Verification Gate)

This directory provides standardized, production-grade smoke test recipes designed to satisfy the **S7-B Runtime Smoke Verification Gate** across all supported tech stacks.

## The Principle: Zero-Mock Runtime Verification
Mocks hide runtime wiring mismatches, missing dependency injection beans, broken SQL migrations, unconfigured environment ports, and event loop deadlocks.
Every smoke test in this directory boots the **real runtime context** against a real socket or active test database, proving operational viability before code moves to S8 Code Review.

## Available Templates

| Stack | File | Runtime Invariant Enforced |
| :--- | :--- | :--- |
| **Java / Spring Boot 3+** | [`springboot-smoke.java`](springboot-smoke.java) | Real `@SpringBootTest(webEnvironment = RANDOM_PORT)`, Datasource Hikari ping, `/actuator/health` probe. |
| **Python / FastAPI 0.115+** | [`fastapi-lifespan-smoke.py`](fastapi-lifespan-smoke.py) | Async `lifespan` context boot, database connection pool validation, `/health` response. |
| **Next.js 16+ / React 19** | [`nextjs-smoke.spec.ts`](nextjs-smoke.spec.ts) | Real DOM mount test without mock fallback, route handler `/api/health` status 200. |
| **Rust / Axum 0.8+ / Tokio** | [`rust-axum-smoke.rs`](rust-axum-smoke.rs) | Ephemeral socket bind (`0.0.0.0:0`), Axum router assembly, HTTP GET `/health` status check. |
| **Angular 21+ LTS** | [`angular-smoke.spec.ts`](angular-smoke.spec.ts) | Standalone root component mounting, zoneless change detection trigger, router outlet assertion. |

## How Subagents Adapt These Templates
1. **S6 Implementation Phase**: If the repository lacks a runtime smoke test, copy the relevant template to the project's test directory (e.g. `src/test/java/.../SmokeTest.java` or `tests/smoke/test_smoke.py`).
2. **S7 Automated Testing Phase**: Run the corresponding Tier 3B test command defined in `skills/s7-testing/resources/test-commands.md`.
3. **S8 Code Review Phase**: The reviewer checks the test output logs to verify that the runtime context booted successfully and that real sockets/databases were validated without bypass mocks.
