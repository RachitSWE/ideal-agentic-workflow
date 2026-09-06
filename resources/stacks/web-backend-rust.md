# Stack Pack: Rust Backend

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Rust backend applications. An auditor MUST verify that `Cargo.toml` files comply with these versions to prevent compilation failures and dependency conflicts. Keeping the Rust toolchain updated is essential for benefiting from the latest safety features and borrow checker improvements.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Rust (Edition) | 2021 | None | Pre-2018 editions |
| Tokio | 1.0.0 | `features = ["full"]` for servers | Sync-only runtimes |
| Axum (or Actix) | 0.7.0 | `tokio` | Synchronous blocking code |

## 2. Architecture Rules
These rules define the structural boundaries and memory patterns of a Rust backend. The codebase MUST adhere strictly to these constraints to ensure memory safety, concurrency, and maximum performance. Violating these constraints often results in deadlocks, memory churn, or blocked executors.

- **Error Type Discipline**: The application MUST differentiate between library errors and application errors. Use the `thiserror` crate for defining domain/library-level error enums, and use the `anyhow` crate for application-level error handling (e.g., in `main()` or generic request handlers where the exact error type is opaque).
- **No Panics in Production**: The application MUST NOT use `.unwrap()` or `.expect()` in request handling paths or business logic. All `Result` and `Option` types MUST be propagated using the `?` operator or handled explicitly via `match`.
- **Concurrent State Management**: For shared mutable state, the application MUST prefer `DashMap` (from the `dashmap` crate) over `Arc<Mutex<HashMap>>` for high-concurrency maps, as `DashMap` shards the locks and prevents global bottlenecks. For simple values, `Arc<RwLock<T>>` is preferred over `Mutex` if reads vastly outnumber writes.
- **Connection Pool Sizing**: Database connections (e.g., using `sqlx`) MUST use a connection pool (like `PgPool`). The pool's `max_connections` MUST be explicitly configured based on the expected worker thread count and database limits.
- **WASM Compilation Constraints**: If the Rust application is intended to be compiled to WebAssembly (e.g., using `wasm-bindgen`), the codebase MUST NOT rely on standard library features that are unavailable in the `wasm32-unknown-unknown` target, such as `std::fs`, `std::thread`, or blocking network sockets. All async operations must be compatible with the WASM event loop.

## 3. Common Anti-Patterns
The following anti-patterns highlight the most common architectural mistakes made in asynchronous Rust applications. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent thread starvation and memory leaks.

#### AP-RUST-01: Blocking the Async Runtime
**What it is**: Executing long-running, CPU-bound, or synchronous I/O operations directly inside an `async fn` running on the Tokio runtime.
**Detection signal**: Use of `std::fs`, `std::thread::sleep`, heavy cryptographic hashing, or synchronous database clients (like `diesel` without `async` features) inside an `async` function.
**Consequence**: The async executor thread is blocked, preventing other async tasks from running. Under load, this causes the entire web server to stall and drop requests.
**Correct alternative**: Wrap blocking operations in `tokio::task::spawn_blocking(move || { ... })`.

#### AP-RUST-02: Unnecessary Memory Allocations
**What it is**: Repeatedly allocating heap memory (e.g., cloning `String` or `Vec`) in hot request paths when a reference or a zero-copy type could be used.
**Detection signal**: Extensive use of `.clone()`, `.to_string()`, or passing large structs by value in request handlers instead of borrowing (`&T`).
**Consequence**: High memory churn and CPU overhead from the allocator, severely reducing the maximum requests-per-second (RPS) the server can handle.
**Correct alternative**: Pass by reference where possible, use `Arc<T>` for shared read-only data to make cloning cheap, and use `Cow<'a, str>` for copy-on-write strings.

#### AP-RUST-03: Blindly Using Mutexes
**What it is**: Wrapping large, frequently accessed data structures in `std::sync::Mutex` or `tokio::sync::Mutex` without analyzing the contention.
**Detection signal**: `Arc<Mutex<AppState>>` where `AppState` is read by every request but modified rarely.
**Consequence**: Lock contention becomes the primary performance bottleneck, essentially forcing concurrent requests to execute sequentially.
**Correct alternative**: Use `tokio::sync::RwLock` for read-heavy workloads, or channel-based actor models for complex state mutations.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a Rust backend codebase. Failure to check these items may result in thread starvation, panics at runtime, or severe performance bottlenecks under load.
- [ ] No `std::fs` or heavy CPU-bound tasks execute directly in an `async fn` without `spawn_blocking`.
- [ ] No `.unwrap()` or `.expect()` calls exist outside of tests or application startup code.
- [ ] `thiserror` is used for domain error enums, and `anyhow` is used for generic propagation.
- [ ] High-concurrency hash maps use `DashMap` rather than `Arc<Mutex<HashMap>>`.
- [ ] Database interactions use a properly configured connection pool.
- [ ] Large structs are passed by reference or wrapped in `Arc` rather than cloned in hot paths.
- [ ] Any WASM targets do not use `std::thread` or `std::fs` modules.

## 5. Useful References
The following resources provide authoritative guidance on building highly concurrent, safe backend systems in Rust. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions regarding the Tokio runtime, error handling, or memory management. Staying updated with these resources is critical to avoiding subtle deadlocks and concurrency bugs.
- [Tokio: CPU-bound tasks and blocking code](https://tokio.rs/tokio/tutorial/spawning#cpu-bound-tasks-and-blocking-code): Explains how to properly bridge synchronous and asynchronous code.
- [Rust API Guidelines: Error Handling](https://rust-lang.github.io/api-guidelines/interoperability.html): Best practices for designing error enums and using the `?` operator.
- [Axum Documentation](https://docs.rs/axum/latest/axum/): Comprehensive guide to routing, middleware, and request extraction in the Axum framework.
- [Rust Atomics and Locks](https://marabos.nl/atomics/): In-depth exploration of concurrency primitives and lock contention mitigation in Rust.
