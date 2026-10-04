# Critical Rules: PostgreSQL + Hibernate ORM + Flyway

This document defines the strict, non-negotiable architectural rules and invariants for projects using PostgreSQL, Hibernate ORM 6+, and Flyway database migrations.

---

## 1. Scope & Target Stack
- **Database**: PostgreSQL 14+ / 16+
- **Persistence Provider**: Hibernate ORM 6.x (Jakarta Persistence 3.x)
- **Migration Framework**: Flyway 9.x+ / 10.x+
- **Applicable Files**: `src/main/resources/db/migration/*.sql`, `**/*Entity.java`, `**/*Repository.java`, `application*.yml`, `application*.properties`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-PHF-01: Absolute Schema Authority (Flyway Only)
- `spring.jpa.hibernate.ddl-auto` MUST be set strictly to `validate` in all environments.
- Setting `ddl-auto=update`, `create`, or `create-drop` is a CRITICAL VIOLATION.
- All table structures, constraints, indexes, sequences, and foreign keys MUST be created solely via Flyway SQL migration scripts.

### RULE-PHF-02: Migration Immutability & Timestamp Naming
- Flyway migration scripts are strictly immutable once committed or applied.
- NEVER edit an existing migration script in `src/main/resources/db/migration/`.
- Every migration MUST be forward-only and named using strict timestamps:
  `V{YYYYMMDDHHMMSS}__{descriptive_snake_case_title}.sql`

### RULE-PHF-03: Mandatory Lazy Fetching
- Every `@ManyToOne` and `@OneToOne` association MUST explicitly specify `fetch = FetchType.LAZY`.
  ```java
  // MANDATORY
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "customer_id", nullable = false)
  private Customer customer;
  ```
- Bare `@ManyToOne` or `@OneToOne` omitting `FetchType.LAZY` is FORBIDDEN.
- All collection associations (`@OneToMany`, `@ManyToMany`) MUST remain lazy.

### RULE-PHF-04: Sequence Primary Keys (No Identity on Batch Entities)
- PostgreSQL entities with synthetic numeric keys MUST use `GenerationType.SEQUENCE` coupled with `@SequenceGenerator`:
  ```java
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "item_seq_gen")
  @SequenceGenerator(name = "item_seq_gen", sequenceName = "items_id_seq", allocationSize = 50)
  private Long id;
  ```
- `GenerationType.IDENTITY` disables JDBC batch insertion in Hibernate and is prohibited on entities subject to batch writes.

### RULE-PHF-05: N+1 Prevention via Explicit Join Fetching
- Iterating lazy associations in loops without eager batching is prohibited.
- Queries fetching parent entities with child collections MUST use `JOIN FETCH` (in JPQL/HQL) or `@EntityGraph(attributePaths = {"..."})` in Spring Data repositories.

### RULE-PHF-06: Explicit Foreign Key Indexing
- Every foreign key constraint defined in a Flyway DDL script MUST be accompanied by an explicit B-tree index in PostgreSQL:
  ```sql
  ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id);
  CREATE INDEX idx_orders_customer_id ON orders(customer_id);
  ```

### RULE-PHF-07: Open Session In View (OSIV) Must Be Disabled
- `spring.jpa.open-in-view: false` MUST be set in configuration.
- Database connections must be returned to the HikariCP pool immediately upon Service transaction completion.

### RULE-PHF-08: Read-Only Transaction Optimization
- Any Service method that only executes read queries MUST declare `@Transactional(readOnly = true)` to avoid Hibernate dirty-check snapshot allocation overhead.

### RULE-PHF-09: Optimistic Concurrency Locking
- All mutable domain entities subject to concurrent updates MUST declare an `@Version` column (`private Long version;`).
