# Stack Pack: Rust Backend (Axum & Tokio)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for high-performance systems and web backend services built with Rust, Axum, and Tokio.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Rust Toolchain | 1.80.0+ (2021 Edition) | `rustc`, `cargo` | Rust < 1.78.0 |
| Axum Web Framework | 0.7.5+ | `axum` >= 0.7.5, `tower` >= 0.4.13, `tower-http` | Axum 0.6.x (breaking extractor API changes) |
| Async Runtime | Tokio 1.38.0+ | `tokio = { version = "1.38", features = ["full"] }` | Mixing incompatible async runtimes |
| Serialization Engine | Serde 1.0.200+ | `serde = { version = "1.0", features = ["derive"] }`, `serde_json` | Legacy untyped serialization |
| Error Handling | thiserror 1.0+ / anyhow 1.0+ | `thiserror` for library/domain errors, `anyhow` for app boundaries | Untyped `Box<dyn Error>` in domain APIs |

## 2. Architecture Rules
These rules define the memory safety, concurrency models, error discipline, and cancellation safety for Rust backend architectures.

- **Tokio Async Concurrency Hygiene**: Developers MUST NEVER execute CPU-bound loops, synchronous file I/O, or blocking network calls directly inside a Tokio async task. Blocking the worker thread stalls other coroutines on that thread. Heavy synchronous or blocking tasks MUST be spawned on the blocking pool using `tokio::task::spawn_blocking`.
- **Async Cancellation Safety**: In Tokio, when a future is dropped before completion (e.g., due to an HTTP client disconnect or `tokio::select!` branch completion), its execution halts immediately. Any critical state update spanning multiple steps MUST be cancellation-safe. Code holding resources across `.await` points MUST protect against partial state corruption.
- **Zero `unwrap()` and `expect()` in Production Code Paths**: The use of `.unwrap()` or `.expect()` in production execution paths is strictly FORBIDDEN. All fallible operations MUST propagate errors via `Result<T, E>` and the `?` operator, or handle default recovery explicitly. Panicking in production web handlers crashes worker threads and leads to denial-of-service.
- **Type-Safe Extractors & State Sharing in Axum 0.7**: Application state MUST be shared using `axum::extract::State` with an `Arc<AppState>`. Extractors MUST be ordered correctly (e.g., body extractors like `Json` must come last in handler signatures).
- **Graceful Shutdown & Signal Handling**: Backend services MUST implement graceful shutdown hooks using `tokio::signal::ctrl_c()`, allowing ongoing HTTP connections and database transactions to drain cleanly before terminating.
- **Mandatory Runtime HTTP Smoke Verification (S7-B Gate)**: Unit tests utilizing pure unit mocks alone CANNOT satisfy S7 verification. Any changes modifying routing, middleware, extractors, or application state MUST execute an automated runtime smoke test using `axum-test` or `reqwest` verifying real TCP/socket binding, request deserialization, and HTTP response status codes.

## 3. Common Anti-Patterns

#### AP-RUST-01: Panicking in Production via `.unwrap()`
**What it is**: Calling `.unwrap()` or `.expect()` on `Option` or `Result` types in production handlers.
**Detection signal**: Direct calls to `.unwrap()` in route handlers, services, or repository layers.
**Consequence**: Unexpected `None` or `Err` causes a thread panic, dropping active connections and degrading server stability.
**Correct alternative**: Match and handle errors explicitly, or propagate using `?` with a typed domain error implementing `IntoResponse`.

#### AP-RUST-02: Blocking the Tokio Async Worker Thread
**What it is**: Executing synchronous disk operations (`std::fs`), synchronous HTTP calls (`reqwest::blocking`), or CPU-intensive computations inside `async fn`.
**Detection signal**: Synchronous standard library I/O or long compute loops called without `spawn_blocking`.
**Consequence**: Starves Tokio reactor threads, drastically increasing latency and causing request timeouts for concurrent clients.
**Correct alternative**: Use `tokio::fs` for file I/O and `tokio::task::spawn_blocking` for CPU-intensive tasks.

#### AP-RUST-03: Holding Non-Send Locks Across `.await` Points
**What it is**: Holding a `std::sync::MutexGuard` across an `.await` boundary in an async function.
**Detection signal**: Compiler error `future cannot be sent between threads safely` or holding `std::sync::Mutex` across `.await`.
**Consequence**: Prevents the async task from migrating between Tokio worker threads, causing deadlocks and compiler failures.
**Correct alternative**: Scope standard locks so the guard drops before `.await`, or use `tokio::sync::Mutex`.

## 4. Audit Checklist
- [ ] Production code is completely free of `.unwrap()` and `.expect()` calls.
- [ ] No blocking synchronous I/O or heavy compute loops run on async worker threads.
- [ ] Mutex guards are not held across `.await` points; Tokio synchronization primitives are used where needed.
- [ ] Axum 0.7 extractors and `State` are correctly structured and type-safe.
- [ ] Graceful shutdown hooks are implemented for clean process termination.
- [ ] Real runtime HTTP smoke test passes green using `axum-test` or live client (S7-B Gate).

## 5. Useful References
- [Axum Official Documentation](https://docs.rs/axum/latest/axum/)
- [Tokio Async Runtime Guide](https://tokio.rs/tokio/tutorial)
- [Async Cancellation Safety in Rust](https://docs.rs/tokio/latest/tokio/macro.select.html#cancellation-safety)
