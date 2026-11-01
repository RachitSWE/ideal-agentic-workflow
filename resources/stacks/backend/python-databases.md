# Stack Pack: Python Databases (SQLAlchemy Async, Motor & Redis)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Python asynchronous database integration across relational (PostgreSQL), document (MongoDB), and caching (Redis) persistence layers.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| PostgreSQL (Async) | 16+ LTS | `SQLAlchemy` >= 2.0.30, `asyncpg` >= 0.29.0 | Legacy SQLAlchemy 1.4 sync patterns, `psycopg2` in async def |
| MongoDB (Async) | 8.0+ LTS | `motor` >= 3.5.0, `beanie` >= 1.26.0 (optional ODM) | Blocking `pymongo` in async routes, MongoDB <= 7.0 (EOL) |
| Redis (Async) | 7.2+ / 8.0 | `redis[asyncio]` >= 5.1.0 | Deprecated `aioredis` standalone package |
| Migration Engine | Alembic 1.13+ | `alembic` configured with async db template | Manual unversioned table creation |

## 2. Architecture Rules
These rules define the connection pool lifecycle, async transaction boundaries, and query safety across Python database services.

- **Asynchronous Driver Mandate**: In asynchronous applications (FastAPI/Starlette/Sanic), all database interactions MUST use asynchronous drivers (`asyncpg`, `motor`, `redis.asyncio`). Synchronous blocking drivers (`psycopg2`, standard `pymongo`) in coroutines are strictly PROHIBITED because they block the asyncio event loop.
- **SQLAlchemy 2.0 2.0-Style Execution**: Relational database queries MUST use modern SQLAlchemy 2.0 syntax (`select()`, `execute()`, `scalars()`). Legacy 1.x query chaining (`session.query(User).filter(...)`) is forbidden.
- **Scoped Async Session Management**: Database sessions MUST be managed using async generators and FastAPI dependencies (`async with async_session_maker() as session:`). Unclosed sessions or global session variables shared across concurrent requests are prohibited.
- **Async Transaction Rollback Discipline**: Mutations across relational tables MUST execute within an explicit transaction context (`async with session.begin():`). Any unhandled exception MUST automatically roll back the transaction.
- **Motor / MongoDB BSON Serialization Bounds**: Document queries in Motor MUST enforce query filters using typed Pydantic models or sanitized dictionaries. Unbounded array growth and unindexed queries are forbidden.
- **Mandatory Async Persistence Smoke Gate (S7-B Gate)**: Mocked repositories or in-memory SQLite instances alone CANNOT satisfy S7 verification. Any changes modifying database models, migrations, or caching MUST execute an automated runtime smoke test exercising a real async `create -> read -> delete` cycle against an active test container or service instance.

## 3. Common Anti-Patterns

#### AP-PYD-01: Synchronous Database Drivers in Async Handlers
**What it is**: Using `psycopg2` or synchronous `pymongo` inside FastAPI async route handlers.
**Detection signal**: Importing `psycopg2` or initializing standard `MongoClient` without Motor.
**Consequence**: Each database query freezes the Python event loop, turning an asynchronous server into a serialized single-request bottleneck.
**Correct alternative**: Use `asyncpg` via SQLAlchemy async engine (`create_async_engine`) and `motor.motor_asyncio.AsyncIOMotorClient`.

#### AP-PYD-02: Leaking Unclosed Async Sessions
**What it is**: Creating database sessions without `async with` context managers or failing to close connections in exception paths.
**Detection signal**: Instantiating sessions without context managers or dependency cleanup: `session = SessionLocal()`.
**Consequence**: Database connection pool becomes exhausted under moderate load, resulting in `TimeoutError: QueuePool limit of size X reached`.
**Correct alternative**: Inject sessions using FastAPI `Depends` with an `async def get_db()` generator yielding the session within `async with`.

#### AP-PYD-03: Missing Migration Versioning with Alembic
**What it is**: Relying on `Base.metadata.create_all()` in production code instead of versioned Alembic migrations.
**Detection signal**: Calling `create_all()` during application lifespan startup in staging/production environments.
**Consequence**: Schema alterations, index adjustments, or column removals fail to execute, causing runtime discrepancies between model and database.
**Correct alternative**: Author and apply versioned Alembic migrations (`alembic revision --autogenerate`, `alembic upgrade head`).

## 4. Audit Checklist
- [ ] All database drivers and clients use native async implementations (`asyncpg`, `motor`, `redis.asyncio`).
- [ ] SQLAlchemy queries utilize modern 2.0-style `select()` syntax and `async_session_maker`.
- [ ] Database sessions are cleanly scoped with async context managers and injected via dependencies.
- [ ] Schema changes are versioned using Alembic migration scripts.
- [ ] Real persistence cycle smoke test passes green against live or containerized datastores (S7-B Gate).

## 5. Useful References
- [SQLAlchemy 2.0 Asyncio Guide](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html)
- [Motor (Async Python Driver for MongoDB)](https://motor.readthedocs.io/en/stable/)
- [Redis-py Asyncio Documentation](https://redis.readthedocs.io/en/stable/examples/asyncio_examples.html)
