# Critical Rules: Rust Systems & Web Backend

This document defines the strict, non-negotiable architectural rules and invariants for projects using Rust (Edition 2021+), Tokio, Axum/Actix, and systems concurrency.

---

## 1. Scope & Target Stack
- **Language**: Rust Edition 2021+
- **Async Runtime**: Tokio 1.x
- **Web Framework**: Axum 0.7+ / Actix-Web 4+
- **Applicable Files**: `src/**/*.rs`, `Cargo.toml`, `Cargo.lock`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-RUST-01: Zero Panics in Production (`unwrap`/`expect` Prohibition)
- Calling `.unwrap()` or `.expect()` inside request handling, domain logic, or worker tasks is strictly FORBIDDEN.
- Every `Result` and `Option` MUST be handled via pattern matching (`match`, `if let`) or propagated via the `?` operator.
- `.unwrap()` is permitted ONLY in tests or static initialization assertions during application bootstrap.

### RULE-RUST-02: Zero Blocking in Tokio Worker Threads
- Never invoke synchronous filesystem operations (`std::fs`), synchronous sleeps (`std::thread::sleep`), or CPU-intensive computations (hashing, heavy parsing) directly inside Tokio async tasks.
- Blocking operations MUST be explicitly dispatched using `tokio::task::spawn_blocking(move || { ... })`.

### RULE-RUST-03: Strict Error Type Discipline
- Library and domain errors MUST be defined as strongly typed enums using `thiserror`.
- Application entrypoints and generic top-level handlers MAY use `anyhow::Result` or custom HTTP response error types implementing Axum's `IntoResponse`.
- Returning raw strings or boxed trait objects without structured context is prohibited.

### RULE-RUST-04: Lock Contention Elimination
- Monolithic `Arc<Mutex<HashMap<...>>>` for high-throughput reads is FORBIDDEN.
- Use `DashMap` for concurrent key-value state, or `Arc<RwLock<T>>` when reads vastly outnumber writes.
- Never hold a synchronous `std::sync::Mutex` across a `.await` point (causes runtime deadlocks; use `tokio::sync::Mutex` if holding across await is unavoidable).

### RULE-RUST-05: Hot-Path Allocation Discipline
- Avoid unconstrained `.clone()` or `.to_string()` calls inside tight loops or hot request paths.
- Prefer borrowing (`&str`, `&[T]`), `Cow<'a, str>`, and cheap reference counting (`Arc<T>`).

### RULE-RUST-06: Zero Clippy Warnings
- Production code MUST compile cleanly with zero warnings under `cargo clippy -- -D warnings`.
