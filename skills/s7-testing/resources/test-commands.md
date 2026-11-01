# Test Commands Reference

## 1. Overview
This resource defines the standardized verification and testing commands for each supported technology stack in the `ideal-agentic-workflow` plugin. 
During the S7 Automated Testing phase, the agent MUST look up the detected stack (from `.agents/session-[SHA]/context.md`) and execute the corresponding commands in order.

---

## 2. Stack Verification Command Matrix

### 2.1 Web Next.js & React 19 (`frontend/nextjs`)
| Tier | Action | Preferred Command | Fallback Command |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Type Check)** | TypeScript Validation | `npx tsc --noEmit` (Static typecheck ONLY, NOT a test) | `npm run type-check` |
| **Tier 2 (Lint)** | Code Hygiene & Linter | `npm run lint` | `npx eslint . --max-warnings=0` |
| **Tier 3A (Test)** | Unit / Component Tests | `npm test -- --run` / `npx vitest run` | `npx jest --bail` |
| **Tier 3B (Smoke Gate)**| Component Mount & API Smoke | `npx vitest run src/**/smoke.test.ts*` | `npm test -- -t "smoke"` |
| **Monorepo (Turborepo)** | Full Monorepo Check | `npx turbo run check lint test` | `npm run test:all` |

> [!NOTE]
> On Windows PowerShell, if package scripts fail due to execution policy, prefix with `npx` or use `cmd /c npm test`.
> Notice: `npx tsc --noEmit` validates types ONLY. All UI components require automated mount/render tests (Tier 3A/3B).

---

### 2.2 Angular Modern SPA (`frontend/angular`)
| Tier | Action | Preferred Command | Fallback Command |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Type Check)** | TypeScript & Angular Check | `npx ng build --no-ssr` | `npx tsc --noEmit` |
| **Tier 2 (Lint)** | ESLint Hygiene | `npx ng lint` | `npx eslint .` |
| **Tier 3A (Test)** | Unit & Harness Tests | `npx ng test --watch=false --browsers=ChromeHeadless` | `npm test -- --watch=false` |
| **Tier 3B (Smoke Gate)**| Component & DOM Smoke Gate | `npx playwright test tests/smoke` | `npm test -- -t "smoke"` |

---

### 2.3 Web Backend Java / Spring Boot (`backend/backend-java`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Build/Compile)** | Compilation Verification | `./gradlew compileJava` / `mvn compile` | `.\gradlew.bat compileJava` / `mvn compile` |
| **Tier 2 (Lint/Format)** | Spotless / Checkstyle | `./gradlew checkstyleMain` / `mvn checkstyle:check` | `.\gradlew.bat checkstyleMain` / `mvn checkstyle:check` |
| **Tier 3A (Test)** | Unit / Slice Tests | `./gradlew test` / `mvn test` | `.\gradlew.bat test` / `mvn test` |
| **Tier 3B (Smoke Gate)**| ApplicationContext Boot Smoke | `./gradlew test --tests "*SmokeTest*"` | `.\gradlew.bat test --tests "*SmokeTest*"` / `mvn test -Dtest=*SmokeTest*` |

---

### 2.4 Java Persistence & Polyglot Drivers (`backend/java-databases`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Migration Info)** | Flyway Migration Check | `./gradlew flywayInfo` / `mvn flyway:info` | `.\gradlew.bat flywayInfo` / `mvn flyway:info` |
| **Tier 2 (Compile/Validate)**| JPA Metamodel & DDL Check | `./gradlew compileJava` / `mvn test-compile` | `.\gradlew.bat compileJava` / `mvn test-compile` |
| **Tier 3A (Test)** | DataJpa & Migration Tests | `./gradlew test` / `mvn test` | `.\gradlew.bat test` / `mvn test` |
| **Tier 3B (Smoke Gate)**| Real Persistence Cycle Smoke | `./gradlew test --tests "*PersistenceSmokeTest*"` | `.\gradlew.bat test --tests "*PersistenceSmokeTest*"` / `mvn test -Dtest=*PersistenceSmokeTest*` |

---

### 2.5 Web Backend Python / AI (`backend/backend-python`)
| Tier | Action | Preferred Command | Fallback Command |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Type Check)** | Static Typing | `mypy .` / `pyright` | `python -m mypy src/` |
| **Tier 2 (Lint)** | Fast Linter & Formatter | `ruff check .` | `flake8 .` |
| **Tier 3A (Test)** | Test Suite | `pytest` / `python -m pytest -v` | `python -m unittest discover` |
| **Tier 3B (Smoke Gate)**| Runtime Smoke Tests | `pytest tests/smoke/ -v` | `python -m pytest -k smoke` |

---

### 2.6 Python Async Databases (`backend/python-databases`)
| Tier | Action | Preferred Command | Fallback Command |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Migration Check)**| Alembic Current Revision | `alembic current` | `python -m alembic current` |
| **Tier 2 (Type Check)** | Static Typing Models | `mypy src/models` | `python -m mypy src/models` |
| **Tier 3A (Test)** | Async DB Fixture Tests | `pytest tests/db/ -v` | `python -m pytest tests/db/` |
| **Tier 3B (Smoke Gate)**| Async Persistence Smoke Gate | `pytest tests/smoke/test_persistence_smoke.py` | `python -m pytest -k smoke` |

---

### 2.7 Web Backend Rust (`backend/backend-rust`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Type/Syntax)** | Compiler Check | `cargo check` |
| **Tier 2 (Lint)** | Idiom & Linter | `cargo clippy -- -D warnings` |
| **Tier 3A (Test)** | Unit & Integration Tests | `cargo test` |
| **Tier 3B (Smoke Gate)**| Integration Smoke Tests | `cargo test --test smoke` |

---

### 2.8 Rust Databases (`backend/rust-databases`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Query Check)** | SQLx Offline Prepared Check | `cargo sqlx prepare --check` |
| **Tier 2 (Clippy)** | DB Module Clippy Check | `cargo clippy --all-targets -- -D warnings` |
| **Tier 3A (Test)** | DB Integration Tests | `cargo test --test db` |
| **Tier 3B (Smoke Gate)**| Real Datastore Smoke Gate | `cargo test --test db_smoke` |

---

### 2.9 Database PostgreSQL (`database/postgresql`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Schema Check)** | Validate Migration / Schema | `npx prisma validate` / `mvn flyway:info` |
| **Tier 2 (Format / Lint)**| SQL / Schema Format Check | `npx prisma format --check` / `mvn checkstyle:check` |
| **Tier 3A (Generate / Test)**| Client Sync & DB Tests | `npx prisma generate` / `mvn test` |
| **Tier 3B (Smoke Gate)**| Real PostgreSQL CRUD Round-Trip | `npm test -- -t "prisma.smoke"` / `mvn test -Dtest=*PersistenceSmokeTest*` |

---

### 2.10 Database MongoDB (`database/mongodb`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Type Check)** | Schema Type Validation | `npx tsc --noEmit` / `mypy src/models` |
| **Tier 2 (Lint)** | Linter & Style | `npm run lint` / `ruff check src/models` |
| **Tier 3A (Test)** | Document Integration Tests | `npm test -- --run` / `pytest tests/db` |
| **Tier 3B (Smoke Gate)**| Document BSON Persistence Smoke | `npm test -- -t "mongo.smoke"` / `pytest tests/smoke/test_mongo_smoke.py` |

---

### 2.11 Database Redis (`database/redis`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Type Check)** | Key/Cache Type Validation | `npx tsc --noEmit` / `mypy src/cache` |
| **Tier 2 (Lint)** | Linter & Style | `npm run lint` / `ruff check src/cache` |
| **Tier 3A (Test)** | Cache Integration Tests | `npm test -- --run` / `pytest tests/cache` |
| **Tier 3B (Smoke Gate)**| Cache TTL & Lua Script Smoke | `npm test -- -t "redis.smoke"` / `pytest tests/smoke/test_redis_smoke.py` |

---

### 2.12 Minecraft Fabric (`minecraft/mc-fabric`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Build)** | Mod Compilation | `./gradlew build -x test` | `.\gradlew.bat build -x test` |
| **Tier 2 (Check)** | Loom & Style Checks | `./gradlew check` | `.\gradlew.bat check` |
| **Tier 3A (Test)** | Gametest / Unit Tests | `./gradlew test` | `.\gradlew.bat test` |
| **Tier 3B (Smoke Gate)**| Mod Initializers Smoke | `./gradlew test --tests "*SmokeTest*"` | `.\gradlew.bat test --tests "*SmokeTest*"` |

---

### 2.13 Minecraft NeoForge / Forge (`minecraft/mc-forge`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Build)** | Mod Compilation | `./gradlew compileJava` | `.\gradlew.bat compileJava` |
| **Tier 2 (Check)** | Verification Checks | `./gradlew check` | `.\gradlew.bat check` |
| **Tier 3A (Test)** | Mod Unit Tests | `./gradlew test` | `.\gradlew.bat test` |
| **Tier 3B (Smoke Gate)**| Mod Bus & Registry Smoke | `./gradlew test --tests "*SmokeTest*"` | `.\gradlew.bat test --tests "*SmokeTest*"` |

---

## 3. Domain-Driven Targeted Testing (DTT Mandate)

### 3.1 Why Domain-Driven Testing?
In enterprise and brownfield codebases, running 200+ unit, integration, and UI tests on every atomic change is inefficient and causes significant latency. 
During the inner task cycle (**S6 Coding → S7 Testing → S8 Code Review**), the agent MUST run **Domain-Driven Targeted Tests** (DTT)—focusing testing execution strictly on the unit and slice tests for the affected domain service, repository, or component.

The full repository test suite is executed ONLY once, during the **S10 Pre-Commit Gate**, to ensure zero global regressions before committing to git.

### 3.2 Canonical Targeted Test Commands by Stack

| Framework / Tool | Targeted Domain Test Command (Linux/macOS) | Targeted Domain Test Command (Windows PowerShell) |
| :--- | :--- | :--- |
| **Maven (Java / Spring)** | `mvn test -Dtest={Domain}Test` | `mvn test -Dtest={Domain}Test` |
| **Gradle (Java / Spring)**| `./gradlew test --tests "*{Domain}Test*"` | `.\gradlew.bat test --tests "*{Domain}Test*"` |
| **Hibernate / JPA Slice** | `mvn test -Dtest={Entity}RepositoryTest` | `mvn test -Dtest={Entity}RepositoryTest` |
| **Vitest (TypeScript / Next)** | `npx vitest run src/**/{Domain}.test.ts` | `npx vitest run src/**/{Domain}.test.ts` |
| **Jest (TypeScript / Next)**   | `npx jest src/**/{Domain}.test.ts --bail` | `npx jest src/**/{Domain}.test.ts --bail` |
| **Pytest (Python / AI)**       | `pytest tests/unit/test_{domain}.py -v` | `python -m pytest tests/unit/test_{domain}.py -v` |
| **Cargo (Rust)**               | `cargo test {domain}` | `cargo test {domain}` |
| **Fabric / NeoForge Loom**     | `./gradlew test --tests "*{Domain}Test*"` | `.\gradlew.bat test --tests "*{Domain}Test*"` |

### 3.3 Concrete Example: TransactionHistory Task
Suppose the active task in `task.md` is:
`[backend] Implement TransactionHistory service and repository query`

1. **Inner Loop (S7)**:
   The agent identifies the target domain is `Transaction`:
   - Maven: `mvn test -Dtest=TransactionServiceTest`
   - Gradle: `.\gradlew.bat test --tests "*TransactionServiceTest*"`
   - Vitest: `npx vitest run src/services/transaction.test.ts`
   This completes in $< 3$ seconds rather than waiting minutes for 200+ unrelated tests.
2. **Pre-Commit Gate (S10)**:
   Before executing `commands/stage-commit.ps1`, the agent runs the full test suite (`mvn test`, `npm test`, `cargo test`) to ensure zero regressions across the entire project.

---

## 4. Tier 3B: Mandatory Runtime Smoke Verification Gate (S7-B)

### 4.1 The Mock-Only Illusion & S7-B Mandate
Pure Mockito unit tests (`@ExtendWith(MockitoExtension.class)`) or mocked API calls can produce 100% green test passes while the application crashes instantly on boot due to missing bean dependencies, malformed SQL queries, or invalid configuration properties.
Before proceeding to S8 Code Review, the agent MUST execute the **S7-B Runtime Smoke Verification Gate**.

### 4.2 Standard S7-B Smoke Test Commands

| Stack / Subsystem | Verification Target | Preferred Command (Linux/macOS) | Preferred Command (Windows PowerShell) |
| :--- | :--- | :--- | :--- |
| **Spring Boot ApplicationContext** | Full bean wiring & context boot (`@SpringBootTest(webEnvironment = RANDOM_PORT)`) | `./gradlew test --tests "*SmokeTest*"` | `.\gradlew.bat test --tests "*SmokeTest*"` / `mvn test -Dtest=*SmokeTest*` |
| **Postgres + Hibernate / JPA** | Real persistence cycle (create -> read -> delete -> read) | `./gradlew test --tests "*PersistenceSmokeTest*"` | `.\gradlew.bat test --tests "*PersistenceSmokeTest*"` / `mvn test -Dtest=*PersistenceSmokeTest*` |
| **Postgres + Prisma** | Real Prisma CRUD persistence round-trip | `npm test -- -t "prisma.smoke"` | `npm test -- -t "prisma.smoke"` |
| **MongoDB + Redis** | Real BSON persistence & cache TTL cycle | `npm test -- -t "smoke"` | `npm test -- -t "smoke"` / `npx vitest run --testNamePattern="smoke"` |
| **Next.js Frontend Mount** | Component DOM mount & API client invocation | `npx vitest run src/**/smoke.test.ts*` | `npx vitest run src/**/smoke.test.ts*` |
| **Python AI / FastAPI** | App lifespan startup & DB model persistence cycle | `pytest tests/smoke/ -v` | `python -m pytest tests/smoke/ -v` |
| **Rust / Axum / Tokio** | Tokio runtime boot, router assembly, DB pool | `cargo test --test smoke` | `cargo test --test smoke` |
| **Minecraft Fabric** | Mod initializers & registry loading smoke | `./gradlew test --tests "*SmokeTest*"` | `.\gradlew.bat test --tests "*SmokeTest*"` |
| **Minecraft NeoForge** | Mod bus & DeferredRegister binding smoke | `./gradlew test --tests "*SmokeTest*"` | `.\gradlew.bat test --tests "*SmokeTest*"` |
| **Container / Gateway Boot** | Docker / Testcontainers health probe | `docker compose ps` | `docker compose ps` |

### 4.3 S7-B Assertions Checklist
Every S7-B smoke test MUST assert:
1. **Context Boot**: Spring `ApplicationContext` or runtime server starts without `UnsatisfiedDependencyException`, `BeanCreationException`, or port conflicts.
2. **Persistence Lifecycle**: A test entity is successfully saved to the database, fetched by ID, verified for field fidelity, deleted, and confirmed removed.
3. **Cache Round-Trip**: Key write with explicit TTL succeeds and subsequent read returns cached value before expiration.
4. **Zero Mocks in Smoke Suite**: S7-B tests MUST NOT use `@MockBean` or fake in-memory repositories that bypass the real database or transport driver.

