# Critical Rules: Rust Backend (Axum & Tokio)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Rust, Axum, and Tokio.

---

## 1. Scope & Target Stack
- **Rust Toolchain**: 1.78.0+ (2021 Edition)
- **Web Framework**: Axum 0.7.0+
- **Async Runtime**: Tokio 1.37.0+
- **Serialization**: Serde 1.0+
- **Applicable Files**: `src/**/*.rs`, `Cargo.toml`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-RUST-01: Async Cancellation Safety Discipline
- In Axum handlers and Tokio async routines, state-mutating operations across `.await` points MUST be audited for cancellation safety.
- Critical operations modifying persistent state across multiple steps MUST NOT be executed directly within a cancellable request future without transactional rollback guards. If a client aborts mid-request, pending futures are dropped immediately.

### RULE-RUST-02: Zero Synchronous Blocking on Tokio Worker Threads
- Synchronous filesystem operations (`std::fs`), synchronous sleeps (`std::thread::sleep`), and CPU-bound computation loops are strictly PROHIBITED on Tokio async worker threads.
- Heavy synchronous or CPU-bound tasks MUST be offloaded using `tokio::task::spawn_blocking(move || { ... })`.

### RULE-RUST-03: Zero Panic Invariant (`.unwrap()` & `.expect()` Prohibition)
- The use of `.unwrap()` or `.expect()` in production execution paths (`src/` excluding tests) is strictly PROHIBITED.
- All fallible operations MUST propagate errors via `Result<T, E>` and the `?` operator or handle fallback explicitly.
- Domain errors must derive `thiserror::Error` and implement `IntoResponse` for consistent HTTP response status mapping.

### RULE-RUST-04: RAII Lock Safety Across Await Suspension
- Holding a synchronous `std::sync::MutexGuard` across an `.await` boundary is strictly FORBIDDEN (violates `Send` and triggers deadlocks).
- Developers MUST scope standard locks to drop before `.await` suspension, or utilize `tokio::sync::Mutex` where lock retention across await points is unavoidable.

### RULE-RUST-05: Mandatory Runtime HTTP Smoke Verification (S7-B Gate)
- Unit tests with pure mocks alone cannot satisfy S7 verification. Any changes modifying routing, middleware, extractors, or state MUST execute an automated runtime smoke test using `axum-test` or `reqwest` asserting real socket binding, request deserialization, and HTTP response status codes.
