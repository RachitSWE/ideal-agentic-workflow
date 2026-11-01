# Critical Rules: Java Databases (JPA/Hibernate, MongoDB & Redis)

This document defines the strict, non-negotiable architectural rules and invariants for projects using polyglot Java persistence layers combining PostgreSQL (JPA/Hibernate), MongoDB, and Redis.

---

## 1. Scope & Target Stack
- **ORM / Relational**: Spring Data JPA 3.2+, Hibernate 6.4+, PostgreSQL 16+
- **Document DB**: Spring Data MongoDB 3.2+, MongoDB 6.0+
- **Cache / KV**: Spring Data Redis 3.2+ (Lettuce 6.3+), Redis 7.2+
- **Migration Engine**: Flyway 10+
- **Applicable Files**: Entity definitions, repository interfaces, database configs, `src/main/resources/db/migration/`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-JAD-01: Immutable Flyway Migration Parity (`ddl-auto: validate`)
- The PostgreSQL relational schema MUST be governed exclusively by immutable SQL migration scripts in `src/main/resources/db/migration/`.
- In production and staging profiles, `spring.jpa.hibernate.ddl-auto` MUST be configured to `validate`. Adding, altering, or removing entity properties without an accompanying numbered Flyway migration is strictly FORBIDDEN.

### RULE-JAD-02: Non-Transactional Boundary Isolation for NoSQL/Cache
- Spring `@Transactional` annotations apply strictly to relational JPA transactions.
- MongoDB and Redis writes inside `@Transactional` methods are non-transactional by default and do NOT roll back on JPA rollback. Document and cache mutations that must be synchronized with transactions MUST execute via `TransactionSynchronizationManager.registerSynchronization` on `afterCommit`.

### RULE-JAD-03: Reactive Redis Cache Eviction & Namespacing
- All Redis cache operations MUST declare explicit TTL durations and use domain-scoped namespaces (`{namespace}:{tenant}:{entity}:{id}`).
- Cache invalidation MUST be executed reactively based on domain lifecycle events or Spring Cache `@CacheEvict` annotations.

### RULE-JAD-04: MongoDB Automated TTL Index Reconciliation
- Ephemeral collections in Spring Data MongoDB (`interaction_logs`, `dispatch_logs`, audit records) MUST configure automated TTL indexes on timestamp fields, verified at application startup via a `BeanPostProcessor` or configuration bean.

### RULE-JAD-05: Mandatory Polyglot Persistence Smoke Gate (S7-B Gate)
- Unit tests with `@MockBean` repositories alone cannot satisfy S7 verification. Any changes introducing or modifying database entities, queries, or caching MUST execute an automated smoke test against active test containers verifying Flyway migration application, JPA persistence, MongoDB document insertion, and Redis TTL eviction.
