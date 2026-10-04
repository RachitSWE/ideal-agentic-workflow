# Test Commands Reference

## 1. Overview
This resource defines the standardized verification and testing commands for each supported technology stack in the `ideal-agentic-workflow` plugin. 
During the S7 Automated Testing phase, the agent MUST look up the detected stack (from `.agents/session-[SHA]/context.md`) and execute the corresponding commands in order.

---

## 2. Stack Verification Command Matrix

### 2.1 Web Next.js / TypeScript / Turborepo (`web-nextjs-turborepo`)
| Tier | Action | Preferred Command | Fallback Command |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Type Check)** | TypeScript Validation | `npx tsc --noEmit` | `npm run type-check` |
| **Tier 2 (Lint)** | Code Hygiene & Linter | `npm run lint` | `npx eslint . --max-warnings=0` |
| **Tier 3 (Test)** | Unit / Component Tests | `npm test -- --run` / `npx vitest run` | `npx jest --bail` |
| **Monorepo (Turborepo)** | Full Monorepo Check | `npx turbo run check lint test` | `npm run test:all` |

> [!NOTE]
> On Windows PowerShell, if package scripts fail due to execution policy, prefix with `npx` or use `cmd /c npm test`.

---

### 2.2 Web Backend Java / Spring Boot (`web-backend-java-spring`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Build/Compile)** | Compilation Verification | `./gradlew compileJava` / `mvn compile` | `.\gradlew.bat compileJava` / `mvn compile` |
| **Tier 2 (Lint/Format)** | Spotless / Checkstyle | `./gradlew checkstyleMain` / `mvn checkstyle:check` | `.\gradlew.bat checkstyleMain` / `mvn checkstyle:check` |
| **Tier 3 (Test)** | Unit / Slice Tests | `./gradlew test` / `mvn test` | `.\gradlew.bat test` / `mvn test` |

---

### 2.3 Web Backend Python / AI (`web-backend-python-ai`)
| Tier | Action | Preferred Command | Fallback Command |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Type Check)** | Static Typing | `mypy .` / `pyright` | `python -m mypy src/` |
| **Tier 2 (Lint)** | Fast Linter & Formatter | `ruff check .` | `flake8 .` |
| **Tier 3 (Test)** | Test Suite | `pytest` / `python -m pytest -v` | `python -m unittest discover` |

---

### 2.4 Web Backend Rust (`web-backend-rust`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Type/Syntax)** | Compiler Check | `cargo check` |
| **Tier 2 (Lint)** | Idiom & Linter | `cargo clippy -- -D warnings` |
| **Tier 3 (Test)** | Unit & Integration Tests | `cargo test` |

---

### 2.5 Database PostgreSQL / Hibernate / Flyway (`database-postgres-hibernate-flyway`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Migration Info)** | Flyway Migration Check | `./gradlew flywayInfo` / `mvn flyway:info` | `.\gradlew.bat flywayInfo` / `mvn flyway:info` |
| **Tier 2 (Compile/Validate)**| JPA Metamodel & DDL Check | `./gradlew compileJava` / `mvn test-compile` | `.\gradlew.bat compileJava` / `mvn test-compile` |
| **Tier 3 (Test)** | DataJpa & Migration Tests | `./gradlew test` / `mvn test` | `.\gradlew.bat test` / `mvn test` |

---

### 2.6 Database PostgreSQL / Prisma (`database-postgres-prisma`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Schema Check)** | Validate Prisma Schema | `npx prisma validate` |
| **Tier 2 (Format)** | Check Prisma Formatting | `npx prisma format --check` |
| **Tier 3 (Client Sync)** | Generate Type Client | `npx prisma generate` |

---

### 2.7 Database MongoDB / Redis (`database-mongo-redis`)
| Tier | Action | Preferred Command |
| :--- | :--- | :--- |
| **Tier 1 (Type Check)** | TypeScript Validation | `npx tsc --noEmit` |
| **Tier 2 (Lint)** | Linter & Style | `npm run lint` |
| **Tier 3 (Test)** | DB Integration & Cache Tests | `npm test -- --run` / `npx vitest run` |

---

### 2.8 Minecraft Fabric (`mc-fabric`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Build)** | Mod Compilation | `./gradlew build -x test` | `.\gradlew.bat build -x test` |
| **Tier 2 (Check)** | Loom & Style Checks | `./gradlew check` | `.\gradlew.bat check` |
| **Tier 3 (Test)** | Gametest / Unit Tests | `./gradlew test` | `.\gradlew.bat test` |

---

### 2.9 Minecraft NeoForge (`mc-neoforge`)
| Tier | Action | Preferred Command (Linux/macOS) | Preferred Command (Windows) |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Build)** | Mod Compilation | `./gradlew compileJava` | `.\gradlew.bat compileJava` |
| **Tier 2 (Check)** | Verification Checks | `./gradlew check` | `.\gradlew.bat check` |
| **Tier 3 (Test)** | Mod Unit Tests | `./gradlew test` | `.\gradlew.bat test` |

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

