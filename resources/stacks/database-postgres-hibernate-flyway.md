# Stack Pack: PostgreSQL + Hibernate + Flyway

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for PostgreSQL, Hibernate ORM 6+, and Flyway database migrations. An auditor MUST verify that `pom.xml` or `build.gradle` files comply with these ranges to prevent dialect mismatches, sequence generator anomalies, and migration validation failures.

| Technology | Minimum Version | Preferred Version | Required Dependencies | Incompatible With |
|---|---|---|---|---|
| **PostgreSQL** | 14.0 | 16.x | `org.postgresql:postgresql` | PostgreSQL < 13 |
| **Hibernate ORM** | 6.2.0 | 6.4+ / 6.5+ | `org.hibernate.orm:hibernate-core` | Hibernate 5.x (Legacy API) |
| **Flyway** | 9.0.0 | 10.x | `org.flywaydb:flyway-core`, `flyway-database-postgresql` | Flyway < 8 |
| **Java Runtime** | 17 LTS | 21 LTS | OpenJDK / Temurin | Java < 17 |

---

## 2. Architecture Rules

The codebase MUST strictly adhere to the following architectural constraints when operating with PostgreSQL, Hibernate, and Flyway:

- **Migration-First Schema Authority**: Flyway is the SOLE authority for database schema structure. Hibernate schema generation MUST be set to validation mode only:
  ```properties
  spring.jpa.hibernate.ddl-auto=validate
  ```
  `ddl-auto=update`, `create`, or `create-drop` is STRICTLY FORBIDDEN in any environment beyond ephemeral isolated unit tests.
- **Flyway Migration Naming & Immutability**:
  - Versioned migrations MUST follow the strict naming schema: `V{YYYYMMDDHHMMSS}__{description}.sql` (or `V{Major}.{Minor}__{description}.sql`) placed in `src/main/resources/db/migration/`.
  - Applied migrations are strictly immutable. Once a migration script is committed or executed against an environment, it MUST NEVER be edited. All schema alterations must be applied via forward-only new migration scripts.
- **Sequence-Based Primary Key Strategy**:
  - PostgreSQL tables MUST use dedicated database sequences for numeric primary keys.
  - Entities MUST use `GenerationType.SEQUENCE` paired with `@SequenceGenerator`:
    ```java
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq_gen")
    @SequenceGenerator(name = "order_seq_gen", sequenceName = "orders_id_seq", allocationSize = 50)
    private Long id;
    ```
  - `GenerationType.IDENTITY` is prohibited for bulk insert entities because it disables JDBC batching in Hibernate.
- **Strict Lazy Fetching Requirement**:
  - All `@ManyToOne` and `@OneToOne` associations MUST explicitly specify `fetch = FetchType.LAZY` (Hibernate defaults them to `EAGER`, causing cascading Cartesian join explosions).
  - All `@OneToMany` and `@ManyToMany` collections MUST remain `FetchType.LAZY`.
- **Query Optimization & N+1 Prevention**:
  - Whenever loading an entity with its relationships, queries MUST use `JOIN FETCH` (in JPQL/HQL) or `@EntityGraph` (in Spring Data JPA).
  - Never access lazy collections inside a loop outside a transaction boundary.
- **Read-Only Transaction Optimization**:
  - Service methods that only read data MUST be annotated with `@Transactional(readOnly = true)`. This signals to Hibernate to disable dirty-checking snapshots, cutting memory allocations by ~50%.
- **Optimistic Locking**:
  - All mutable domain entities subject to concurrent updates MUST declare an optimistic locking field:
    ```java
    @Version
    private Long version;
    ```
- **Connection Management & OSIV Elimination**:
  - `spring.jpa.open-in-view` MUST be explicitly set to `false`. Database sessions MUST terminate at the Service layer, preventing database connections from hanging open during template rendering or JSON serialization.

---

## 3. Common Anti-Patterns

Auditors and reviewers MUST actively detect and reject the following anti-patterns:

#### AP-PHF-01: Hibernate Auto-DDL in Production
- **What it is**: Setting `spring.jpa.hibernate.ddl-auto=update` or `create`.
- **Detection signal**: `hibernate.ddl-auto` set to anything other than `validate` or `none` in application configuration.
- **Consequence**: Hibernate alters schema automatically on startup, bypassing Flyway checksums, dropping constraints, or creating unindexed foreign keys.
- **Correct alternative**: Set `ddl-auto=validate` and execute all DDL changes via Flyway migration scripts.

#### AP-PHF-02: Default Eager Loading on `@ManyToOne`
- **What it is**: Omitting `fetch = FetchType.LAZY` on `@ManyToOne` or `@OneToOne` fields.
- **Detection signal**: Bare `@ManyToOne` annotations without `fetch = FetchType.LAZY`.
- **Consequence**: Loading a single record triggers dozens of immediate outer joins across the entire relational graph.
- **Correct alternative**: Always specify `@ManyToOne(fetch = FetchType.LAZY)`.

#### AP-PHF-03: The Hibernate N+1 Query Problem
- **What it is**: Querying a parent collection and then iterating over children in Java code without `JOIN FETCH`.
- **Detection signal**: A repository query `findAll()` followed by `entity.getChildren().size()` in a loop.
- **Consequence**: Sends $1 + N$ separate SQL queries to PostgreSQL, destroying database performance.
- **Correct alternative**: Use `@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.status = :status")` or `@EntityGraph(attributePaths = {"items"})`.

#### AP-PHF-04: Retroactive Mutation of Flyway Migration Files
- **What it is**: Editing an existing `V1__init.sql` script after it has been executed.
- **Detection signal**: Git diff modifying an older SQL file inside `db/migration/`.
- **Consequence**: Flyway throws `FlywayValidateException: Migration checksum mismatch` on boot, blocking deployments.
- **Correct alternative**: Create a new incremental migration file: `V20261004120000__add_missing_column.sql`.

#### AP-PHF-05: Open Session In View (OSIV) Enabled
- **What it is**: Leaving `spring.jpa.open-in-view=true` (the legacy Spring Boot default).
- **Detection signal**: Missing `spring.jpa.open-in-view=false` in `application.yml` or `application.properties`.
- **Consequence**: DB connection pool starvation because connections remain held until HTTP response completion.
- **Correct alternative**: Add `spring.jpa.open-in-view: false` to application configuration and fetch all required data within `@Transactional` service methods.

---

## 4. Audit Checklist
An auditor MUST verify the following items when auditing a PostgreSQL + Hibernate + Flyway codebase:
- [ ] `spring.jpa.hibernate.ddl-auto` is set to `validate`.
- [ ] `spring.jpa.open-in-view` is set to `false`.
- [ ] All Flyway migrations in `src/main/resources/db/migration/` are sequential and non-mutated.
- [ ] All `@ManyToOne` and `@OneToOne` relationships explicitly declare `fetch = FetchType.LAZY`.
- [ ] Read-only service methods use `@Transactional(readOnly = true)`.
- [ ] Entities with numeric primary keys use `GenerationType.SEQUENCE` (not `IDENTITY`).
- [ ] Foreign keys defined in Flyway DDL have corresponding indexes (`CREATE INDEX idx_... ON table(fk_id)`).
- [ ] Concurrent entities declare `@Version` for optimistic concurrency control.
- [ ] No repository queries iterate lazy relations in loops without `JOIN FETCH` or `@EntityGraph`.

---

## 5. Useful References
- [Hibernate 6 User Guide](https://docs.jboss.org/hibernate/orm/6.4/userguide/html_single/Hibernate_User_Guide.html): Official documentation on Hibernate 6 entity mappings, dialects, and queries.
- [Flyway Documentation](https://documentation.red-gate.com/fd/flyway-documentation): Authoritative guide on versioned migrations, naming conventions, and PostgreSQL support.
- [Vlad Mihalcea on High-Performance Java Persistence](https://vladmihalcea.com/tutorials/hibernate/): Industry-standard benchmarks on N+1 prevention, batching, and sequence optimization.
- [PostgreSQL Indexing Best Practices](https://www.postgresql.org/docs/current/indexes.html): B-tree indexing rules for foreign key lookups.
