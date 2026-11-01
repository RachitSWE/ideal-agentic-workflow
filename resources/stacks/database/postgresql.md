# Stack Pack: PostgreSQL

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for PostgreSQL relational persistence across enterprise applications using Hibernate/Flyway, Prisma, and native connection pools.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| PostgreSQL Server | 16.0+ LTS (Recommended 18 / 19) | Official PostgreSQL Driver, HikariCP, Prisma Client, asyncpg, sqlx | PostgreSQL <= 14 (EOL November 2026) |
| Java / Spring Boot | Java 21 LTS (Recommended 25 LTS) | Spring Boot 3.4+ / 4.0+, Hibernate 6.5+, Flyway 10+, HikariCP 5+ | Java < 21 |
| Node.js / TypeScript | Node 22 LTS / 26 LTS | Prisma 5.16+ / 6+, `@prisma/client`, `pg` 8.12+ | Node.js < 22 (Node 20 EOL) |
| Python | Python 3.12+ (Recommended 3.14) | `asyncpg` >= 0.29.0, `SQLAlchemy` >= 2.0.30 | Python <= 3.10 (EOL October 2026) |
| Rust | Rust 1.80+ (2021 Edition) | `sqlx` (with `runtime-tokio-rustls`, `postgres`), `deadpool-postgres` | Unpooled connection handshakes |

## 2. Architecture Rules
These rules define the schema authority, migration immutability, transaction boundaries, and indexing discipline for PostgreSQL databases.

- **Migration-First Schema Authority (`ddl-auto: validate`)**: In production and staging environments, the database schema MUST be governed exclusively by immutable, version-controlled migration scripts (e.g. Flyway `V<N>__<description>.sql` or Prisma migrations). ORM automatic schema mutation (`hibernate.ddl-auto: update` or `create-drop`) is strictly FORBIDDEN in production. Applications MUST set `ddl-auto: validate` or verify Prisma schema synchronization prior to startup.
- **Index Placement & Foreign Key Indexing**: Every foreign key column used in joins or relational lookups MUST have an explicit index created in PostgreSQL. Relational lookups, composite filter predicates, and high-frequency sorting columns MUST be backed by B-tree or covering indexes to prevent sequential table scans.
- **Transaction Scope & Connection Pool Discipline**: Transactions MUST be kept minimal and bounded. Long-running external network requests, third-party API calls, and heavy disk I/O MUST NEVER occur inside an active database transaction. Read-only queries MUST be marked explicitly (e.g. `@Transactional(readOnly = true)` in Spring Data) to enable read replica routing and skip dirty-checking overhead.
- **Connection Pool Sizing**: Connection pools (HikariCP, Prisma pool, asyncpg pool) MUST be configured with bounded maximum connections matched to database CPU core counts (`max_connections = (core_count * 2) + effective_spindle_count`) to avoid thread contention and PostgreSQL connection starvation.
- **Strict Parameterized Queries**: Dynamic SQL generation with string interpolation or concatenation is strictly PROHIBITED. All database queries MUST use parameterized inputs or ORM criteria queries to eliminate SQL injection vulnerabilities.
- **Mandatory Runtime Bootstrap & Schema Parity Smoke Verification (S7-B Gate)**: Unit tests with mocked repositories or H2 in-memory databases alone CANNOT satisfy S7 verification. Any changes modifying entity definitions, relations, or migration scripts MUST execute an automated runtime smoke test verifying application startup, schema migration application, and a real `create -> read -> update -> delete` persistence cycle against a real PostgreSQL instance or Testcontainers container.

## 3. Common Anti-Patterns

#### AP-PG-01: Direct Entity Mutation Without Versioned Migration
**What it is**: Adding or modifying entity fields (JPA `@Column`, Prisma schema fields) without adding an immutable numbered migration script.
**Detection signal**: Discrepancy between code entity models and migration directories (`db/migration/` or `prisma/migrations/`).
**Consequence**: Application fails to boot in production with `SchemaManagementException` or runtime column mismatches.
**Correct alternative**: Always generate a numbered migration (`V7__add_status_column.sql` or `prisma migrate dev`) before updating entity code.

#### AP-PG-02: Missing Indexes on Foreign Keys (Sequential Scan Cascades)
**What it is**: Defining `@ManyToOne` or relational foreign keys without creating a matching database index on the foreign key column.
**Detection signal**: Foreign key columns present in schema without an accompanying `CREATE INDEX idx_... ON table(foreign_key_col)`.
**Consequence**: Cascade deletes and table joins force PostgreSQL into sequential scans across large tables, degrading throughput and causing transaction lock waits.
**Correct alternative**: Ensure every foreign key column has an explicit B-tree index.

#### AP-PG-03: Long-Running External I/O Inside Database Transactions
**What it is**: Invoking external REST APIs, webhooks, or slow disk operations while holding an open database transaction lock.
**Detection signal**: HTTP client calls (`restClient.get()`, `fetch()`, `httpx.get()`) wrapped inside `@Transactional` or `prisma.$transaction`.
**Consequence**: Holds database connection and row locks open for seconds, quickly exhausting the connection pool and causing database-wide lock timeouts.
**Correct alternative**: Fetch external data before opening the transaction, or process outbound requests asynchronously after transaction commit.

## 4. Audit Checklist
- [ ] Schema changes are governed exclusively by immutable, numbered migration scripts.
- [ ] Production configuration enforces `hibernate.ddl-auto: validate` or static schema parity verification.
- [ ] All foreign key columns and composite search attributes have covering indexes.
- [ ] External network/API calls are strictly quarantined outside transaction blocks.
- [ ] Read queries use read-only transaction annotations or non-locking query modes.
- [ ] Real PostgreSQL persistence smoke cycle passes green against live or containerized instance (S7-B Gate).

## 5. Useful References
- [PostgreSQL Indexing & Performance Best Practices](https://www.postgresql.org/docs/current/indexes.html)
- [HikariCP Connection Pool Sizing Formula](https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing)
- [Flyway Database Migrations Documentation](https://documentation.red-gate.com/fd/quickstart-how-flyway-works-184127223.html)
