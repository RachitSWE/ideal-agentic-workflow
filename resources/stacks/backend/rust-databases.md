# Stack Pack: Rust Databases (SQLx, MongoDB & Redis)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Rust asynchronous database drivers and connection pools across relational (PostgreSQL via SQLx), document (MongoDB), and caching (Redis) persistence layers.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| PostgreSQL (SQLx) | 16+ LTS | `sqlx = { version = "0.8", features = ["runtime-tokio-rustls", "postgres", "macros", "chrono", "uuid"] }` | SQLx <= 0.6 |
| MongoDB Driver | 8.0+ LTS | `mongodb = { version = "3.0", features = ["tokio-runtime"] }` | Blocking sync MongoDB drivers, Mongo <= 7.0 |
| Redis Driver | 7.2+ / 8.0 | `redis = { version = "0.26", features = ["tokio-comp", "connection-manager", "aio"] }` | Unpooled raw connections in async loops |
| Connection Pool | Bounded | `sqlx::PgPool`, `deadpool-redis` 0.16+, `bb8` | Unbounded connection instantiation |

## 2. Architecture Rules
These rules define the connection pool sizing, compile-time query verification, error propagation, and transactional safety for Rust database layers.

- **Compile-Time Checked Queries (SQLx `query!` / `query_as!`)**: Relational database queries in SQLx SHOULD leverage compile-time query verification via `query!` or `query_as!` against an offline prepared cache (`sqlx-data.json`) or live database instance, ensuring syntax errors, missing columns, and type mismatches are caught during `cargo check`.
- **Connection Pool Lifecycle & Graceful Draining**: Database pools (`PgPool`, Redis connection manager) MUST be instantiated once during application bootstrap, wrapped in an `Arc<AppState>`, and shared across Axum routes. Opening raw database connections inside request handlers is strictly FORBIDDEN.
- **Explicit Transaction RAII Management**: Mutations across multiple relational tables MUST be executed within an explicit SQLx transaction (`pool.begin().await?`). The transaction guard MUST commit explicitly (`tx.commit().await?`); if dropped prematurely due to error or cancellation, the transaction rolls back automatically via RAII.
- **MongoDB Typed BSON Serialization**: Document reads and writes with the official MongoDB driver MUST use strongly typed Serde structs (`derive(Serialize, Deserialize)`). Arbitrary untyped `bson::Document` manipulation is discouraged except for dynamic projection expressions.
- **Redis TTL & Multiplexed Connection Management**: Redis access MUST utilize `redis::aio::ConnectionManager` or a pooled manager (`deadpool-redis`), ensuring automatic reconnects without connection leaks. All cache writes MUST specify TTL expirations.
- **Mandatory Async Persistence Smoke Gate (S7-B Gate)**: Unit tests utilizing fake in-memory mocks alone CANNOT satisfy S7 verification. Any changes introducing or modifying database queries, migrations, or cache commands MUST execute an automated runtime smoke test exercising a real `create -> read -> delete` cycle against an active test container or running database.

## 3. Common Anti-Patterns

#### AP-RUD-01: Instantiating Connection Pools Inside Route Handlers
**What it is**: Calling `PgPoolOptions::new().connect(...)` inside an individual HTTP handler.
**Detection signal**: Database connection pool creation located inside Axum route functions.
**Consequence**: Spawns multiple expensive connection handshakes per request, instantly exhausting database connection limits.
**Correct alternative**: Create the pool once in `main()` and pass it via Axum `State(pool)`.

#### AP-RUD-02: Silent Transaction Rollback Omission (Forgetting Commit)
**What it is**: Performing database mutations on an active `sqlx::Transaction` and returning `Ok(())` without calling `tx.commit().await`.
**Detection signal**: A transaction variable `tx` dropping at the end of a successful handler without `.commit().await`.
**Consequence**: The SQLx transaction drops and issues a rollback, causing data mutations to silently disappear despite a 200 OK response.
**Correct alternative**: Always call `tx.commit().await?` as the final step before returning a successful response.

#### AP-RUD-03: Storing Keys in Redis Without Expiration (Memory Bloat)
**What it is**: Writing cache items via `redis::cmd("SET")` without setting an `EX` duration.
**Detection signal**: Using raw `SET` commands without passing expiration flags.
**Consequence**: Redis memory consumption climbs continuously, eventually triggering evictions or memory exhaustion.
**Correct alternative**: Use `SETEX` or `redis::cmd("SET").arg(key).arg(val).arg("EX").arg(ttl)`.

## 4. Audit Checklist
- [ ] Database pools and connection managers are created once during bootstrap and shared via `State`.
- [ ] SQLx transactions explicitly commit before returning success.
- [ ] MongoDB document schemas are modeled using typed Serde structs.
- [ ] Redis writes include mandatory TTL expirations.
- [ ] Error types are properly mapped and propagated without panicking (`?` operator used).
- [ ] Real persistence cycle smoke test passes green against running datastore (S7-B Gate).

## 5. Useful References
- [SQLx Official Documentation & Prepared Queries](https://docs.rs/sqlx/latest/sqlx/)
- [MongoDB Rust Driver Documentation](https://www.mongodb.com/docs/drivers/rust/)
- [Redis-rs Async Documentation](https://docs.rs/redis/latest/redis/aio/index.html)
