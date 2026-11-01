# Stack Pack: Java Databases (JPA/Hibernate, MongoDB & Redis)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for polyglot Java persistence layers combining relational storage (PostgreSQL via Hibernate), document persistence (MongoDB), and in-memory key-value caching (Redis).

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Spring Data JPA / Hibernate | 3.4+ / Hibernate 6.5+ | `spring-boot-starter-data-jpa`, `postgresql` driver | Hibernate 5, unmanaged schema generation |
| Spring Data MongoDB | 3.4+ / 4.0+ | `spring-boot-starter-data-mongodb` (Mongo Java Driver 5.2+) | Mongo Java Driver < 5.0 |
| Spring Data Redis / Lettuce | 3.4+ / Lettuce 6.4+ | `spring-boot-starter-data-redis` | Deprecated Jedis pools in reactive contexts |
| Database Migration Engine | Flyway 10.15+ | `flyway-core`, `flyway-database-postgresql` | Liquibase / Flyway version mismatch |

## 2. Architecture Rules
These rules define the integration boundaries, connection isolation, transaction governance, and polyglot synchronization patterns across Java persistence layers.

- **Immutable Flyway Migration Parity (`ddl-auto: validate`)**: The PostgreSQL relational schema MUST be governed exclusively by immutable SQL migration scripts in `src/main/resources/db/migration/` following sequential naming (`V1__...`, `V2__...`). In production and test environments, `spring.jpa.hibernate.ddl-auto` MUST be configured to `validate`. Adding or altering JPA entity properties without an accompanying numbered Flyway migration is strictly FORBIDDEN.
- **Polyglot Store Isolation & Datastore Specialization**:
  - Relational data (users, servers, roles, billing, transactions) MUST reside in PostgreSQL with full ACID transaction guarantees.
  - High-volume, append-only logs, dispatch events, audit trails, and unstructured JSON payloads MUST reside in MongoDB.
  - Ephemeral cache entries, session tokens, distributed locks, and sliding-window rate limit counters MUST reside in Redis.
- **Transaction Boundary Demarcation**: Spring `@Transactional` annotations apply strictly to relational JPA data sources. MongoDB and Redis operations are non-transactional by default and MUST NOT rely on JPA transaction rollback behavior. Polyglot operations spanning JPA and MongoDB/Redis MUST implement explicit compensation logic or saga orchestration.
- **Redis Cache Invalidation via Domain Events**: Cache eviction MUST be performed reactively based on domain lifecycle events or Spring Cache annotations (`@CacheEvict(value = "guild:details", key = "#id")`). Unmanaged raw key writes without cache eviction triggers are prohibited.
- **MongoDB Automated TTL Index Lifecycle**: Ephemeral collections in Spring Data MongoDB (such as `interaction_logs`, `dispatch_logs`) MUST configure automated TTL index reconciliation on date fields (`@Indexed(expireAfterSeconds = 2592000)`), verified at application startup via a `BeanPostProcessor` or configuration bean.
- **Mandatory Polyglot Persistence Smoke Gate (S7-B Gate)**: Unit tests utilizing `@MockBean` for repositories alone CANNOT satisfy S7 verification. Any changes introducing or modifying database entities, queries, or caching MUST execute an automated smoke test against live or containerized datastores verifying actual Flyway migration application, JPA persistence, MongoDB document insertion, and Redis TTL eviction.

## 3. Common Anti-Patterns

#### AP-JAD-01: Direct JPA Entity Schema Drift Without Flyway Migration
**What it is**: Modifying JPA entity fields (`@Column`, `@ManyToOne`) without adding an accompanying numbered Flyway migration script.
**Detection signal**: Hibernate `SchemaManagementException` on startup or missing columns in staging database.
**Consequence**: Application fails to boot in production with `ddl-auto: validate` or drops columns unexpectedly.
**Correct alternative**: Create an immutable SQL migration in `db/migration/` before modifying JPA entity classes.

#### AP-JAD-02: Assuming JPA Transaction Rollbacks Cover MongoDB/Redis
**What it is**: Mutating relational rows and MongoDB/Redis within a `@Transactional` method, expecting rollback on error.
**Detection signal**: Document writes or Redis cache mutations placed inside `@Transactional` methods without compensation handlers.
**Consequence**: An exception in JPA rollback leaves corrupted, orphaned documents in MongoDB and stale cache keys in Redis.
**Correct alternative**: Perform external document and cache writes after transaction commit using `TransactionSynchronizationManager.registerSynchronization`.

#### AP-JAD-03: Unbounded HikariCP and Lettuce Connection Pools
**What it is**: Setting unbounded or arbitrary connection pool sizes for PostgreSQL HikariCP or Redis Lettuce.
**Detection signal**: `maximum-pool-size: 100` in `application.yml` or default unconfigured connection pools.
**Consequence**: High concurrency exhausts database thread limits, leading to connection timeouts and JVM resource starvation.
**Correct alternative**: Calculate pool size based on CPU cores: `((core_count * 2) + spindle_count)`.

## 4. Audit Checklist
- [ ] Flyway migrations match JPA entity definitions 1:1, with `ddl-auto: validate` enabled.
- [ ] Relational, document, and cache data are correctly partitioned across PostgreSQL, MongoDB, and Redis.
- [ ] MongoDB ephemeral collections declare automated TTL indexes on timestamp fields.
- [ ] Redis cache entries have explicit TTL expirations and reactive eviction triggers.
- [ ] Long-running I/O and external calls are isolated outside `@Transactional` methods.
- [ ] Real persistence and cache eviction smoke test passes green against live or containerized datastores (S7-B Gate).

## 5. Useful References
- [Spring Data JPA Reference Documentation](https://docs.spring.io/spring-data/jpa/reference/)
- [Spring Data MongoDB Reference Guide](https://docs.spring.io/spring-data/mongodb/reference/)
- [Spring Data Redis Reference Guide](https://docs.spring.io/spring-data/redis/reference/)
- [Flyway Database Migration Best Practices](https://documentation.red-gate.com/fd/)
