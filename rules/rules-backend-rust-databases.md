# Critical Rules: Rust Databases (SQLx, MongoDB & Redis)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Rust database drivers across PostgreSQL, MongoDB, and Redis.

---

## 1. Scope & Target Stack
- **Relational DB**: PostgreSQL 14+ via `sqlx 0.7+` (Tokio runtime, async)
- **Document DB**: MongoDB 6.0+ via official `mongodb 2.8+` async driver
- **Cache / KV**: Redis 6.2+ via `redis 0.25+` async connection manager
- **Applicable Files**: `src/db/**/*.rs`, `src/repositories/**/*.rs`, `sqlx-data.json`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-RUD-01: Compile-Time Checked Queries via SQLx
- Relational database queries in SQLx SHOULD leverage compile-time query verification (`query!`, `query_as!`) against an offline prepared cache (`sqlx-data.json`) or database container, ensuring syntax errors, missing columns, and type mismatches are caught during `cargo check`.

### RULE-RUD-02: Singleton Connection Pool Lifecycle
- Database pools (`PgPool`, Redis connection managers) MUST be created once during application bootstrap in `main()` and shared via Axum `State(Arc<AppState>)`.
- Instantiating connection pools inside individual route handlers is strictly PROHIBITED.

### RULE-RUD-03: Explicit Transaction RAII Commits
- Mutations across multiple relational tables MUST be executed within an explicit SQLx transaction (`pool.begin().await?`).
- The transaction guard MUST commit explicitly (`tx.commit().await?`); if dropped prematurely due to error or cancellation, the transaction rolls back automatically via RAII. Returning success without calling `.commit().await` is strictly forbidden.

### RULE-RUD-04: Mandatory Redis TTL & Connection Management
- All cache writes via Redis drivers MUST specify explicit TTL expirations.
- Redis client connections MUST use multiplexed async connection managers (`redis::aio::ConnectionManager` or `deadpool-redis`) to prevent connection leaks during network reconnects.

### RULE-RUD-05: Mandatory Async Persistence Smoke Gate (S7-B Gate)
- In-memory mock repositories alone cannot satisfy S7 verification. Any changes modifying database queries or models MUST execute an automated runtime smoke test exercising a real `create -> read -> delete` cycle against a running database container.
