# Critical Rules: Python Databases (SQLAlchemy Async, Motor & Redis)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Python asynchronous database integration across PostgreSQL, MongoDB, and Redis.

---

## 1. Scope & Target Stack
- **Relational DB**: PostgreSQL 14+ via `SQLAlchemy 2.0+` (async engine) & `asyncpg`
- **Document DB**: MongoDB 6.0+ via `motor` (asyncio) or `beanie`
- **Cache / KV**: Redis 6.2+ via `redis[asyncio]`
- **Migration**: Alembic 1.13+
- **Applicable Files**: `src/models/**/*.py`, `src/db/**/*.py`, `alembic/versions/*.py`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-PYD-01: Asynchronous Driver Mandate
- In asynchronous web applications, all database interactions MUST use native async drivers (`asyncpg`, `motor`, `redis.asyncio`).
- Synchronous blocking drivers (`psycopg2`, synchronous `pymongo`) inside coroutines are strictly PROHIBITED because they freeze the Python event loop.

### RULE-PYD-02: SQLAlchemy 2.0 2.0-Style Execution
- Relational database queries MUST use modern SQLAlchemy 2.0 syntax (`select()`, `execute()`, `scalars()`). Legacy 1.x query chaining (`session.query(...)`) is forbidden.

### RULE-PYD-03: Scoped Async Session Lifecycle
- Database sessions MUST be scoped to request lifecycles using async context managers and FastAPI `Depends` generators (`async with async_session_maker() as session:`). Global or shared mutable session instances are prohibited.

### RULE-PYD-04: Explicit Async Transaction Rollbacks
- Multi-row or multi-table mutations MUST be wrapped in an explicit transaction context (`async with session.begin():`). Unhandled exceptions must trigger an immediate rollback.

### RULE-PYD-05: Mandatory Async Persistence Smoke Gate (S7-B Gate)
- Mocked database sessions alone cannot satisfy S7 verification. Any changes modifying models, migrations, or queries MUST execute an automated runtime smoke test exercising a real async persistence cycle against an active database container.
