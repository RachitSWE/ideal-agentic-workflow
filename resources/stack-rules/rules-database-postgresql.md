# Critical Rules: PostgreSQL & Relational Persistence

This document defines the strict, non-negotiable architectural rules and invariants for projects using PostgreSQL relational persistence across enterprise applications.

---

## 1. Scope & Target Stack
- **Database Engine**: PostgreSQL 14.0+ (Recommended 16.0+ LTS)
- **Frameworks & ORMs**: Spring Data JPA / Hibernate 6+, Prisma ORM, SQLAlchemy 2.0 Async, SQLx
- **Migration Engines**: Flyway 10+, Liquibase, Prisma Migrate, Alembic
- **Applicable Files**: Entity models, SQL migration scripts, database configuration, connection pool settings.

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-PG-01: Migration-First Schema Authority (`ddl-auto: validate`)
- Database schemas MUST be modified exclusively via immutable, version-controlled migration scripts (`V<N>__<description>.sql`, `prisma/migrations`, `alembic/versions`).
- In production and staging environments, ORM automatic schema mutation (`hibernate.ddl-auto: update`, `create`, `create-drop`, or unmanaged `prisma db push`) is strictly FORBIDDEN.
- Applications MUST configure `ddl-auto: validate` or verify static schema parity before accepting traffic.

### RULE-PG-02: Mandatory Foreign Key Indexing
- Every foreign key constraint MUST be accompanied by an explicit B-tree index on the child referencing column in PostgreSQL DDL.
- Unindexed foreign keys trigger full sequential scans on child tables during parent record updates/deletions, locking tables and causing transaction deadlocks.

### RULE-PG-03: Covering Index-Only Scans
- High-frequency query projection paths MUST leverage covering indexes (`CREATE INDEX ... INCLUDE (...)`) so that all required columns reside in index leaf pages, eliminating table heap page lookups (`Heap Fetches = 0`).

### RULE-PG-04: Zero Network I/O Inside Active Transactions
- Network requests (HTTP calls, REST clients, webhooks, cloud storage, payment gateways) and heavy CPU-bound cryptography MUST NEVER be executed within an active database transaction (`@Transactional`, `prisma.$transaction`).
- Holding database connections while waiting for network socket responses rapidly depletes connection pools, triggering widespread database timeouts.

### RULE-PG-05: Read-Only Query Optimization
- All query-only service methods MUST declare read-only transaction mode (e.g. `@Transactional(readOnly = true)` in Spring Data) to disable ORM dirty-checking snapshot overhead and route queries to read replicas.

### RULE-PG-06: Bounded Connection Pool Sizing
- Database connection pools (HikariCP, Prisma pool, asyncpg pool) MUST be sized according to hardware CPU core bounds (`maximumPoolSize = (cpu_cores * 2) + effective_spindle_count`). Arbitrary pool inflation ($> 30$ per instance) is forbidden.

### RULE-PG-07: Mandatory Runtime Persistence Smoke Verification (S7-B Gate)
- Mocked repositories or in-memory SQLite/H2 alone cannot satisfy S7 verification. Any changes introducing or modifying database entities, queries, or migration scripts MUST execute an automated runtime smoke test verifying application startup, migration execution, and a real persistence cycle against a real PostgreSQL instance or Testcontainers container.
