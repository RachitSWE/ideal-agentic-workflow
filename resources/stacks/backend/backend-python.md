# Stack Pack: Python Backend (FastAPI & AI Services)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Python backend applications, microservices, and AI inference pipelines built on FastAPI, Pydantic v2, and modern async runtimes.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Python Runtime | 3.12+ (Recommended 3.14 LTS) | Modern async standard library | Python <= 3.10 (EOL October 2026) |
| FastAPI Framework | 0.112.0+ | `fastapi`, `starlette` >= 0.38.0 | FastAPI < 0.100.0 |
| Pydantic | 2.8.0+ | `pydantic` >= 2.8, `pydantic-settings` | Pydantic v1 (`@validator` legacy syntax) |
| ASGI Web Server | Uvicorn 0.30+ | `uvicorn[standard]` (uvloop, httptools) | Synchronous WSGI servers (Gunicorn without Uvicorn workers) |
| Static Type Checker | Mypy 1.11+ or Pyright 1.1.370+ | Strict type annotations | Untyped functions or indiscriminate `# type: ignore` |

## 2. Architecture Rules
These rules define the structural boundaries, event loop hygiene, schema validation, and lifecycle governance for Python backend architectures.

- **Async Event Loop Hygiene**: Inside `async def` route handlers or coroutines, developers MUST NEVER execute synchronous, blocking I/O calls (e.g. `requests.get()`, `time.sleep()`, synchronous database drivers, or CPU-bound loops). Synchronous blocking operations starve the single-threaded asyncio event loop. Any necessary blocking operations MUST be offloaded to a worker thread pool via `asyncio.to_thread()` or `run_in_executor()`.
- **Pydantic v2 Strict Modeling**: All incoming request payloads and outgoing responses MUST be modeled using Pydantic v2 `BaseModel` with explicit field type annotations and field constraints (`Field(..., min_length=1)`). Arbitrary untyped `dict` payloads and legacy Pydantic v1 methods (`.dict()`, `.parse_obj()`) are FORBIDDEN; use `.model_dump()` and `.model_validate()`.
- **Lifespan Context Managers for Resource Lifecycle**: Application startup and shutdown hooks (database connection pool initialization, AI model loading, cache warming) MUST be declared using the modern FastAPI `lifespan` context manager (`@asynccontextmanager`). Legacy `@app.on_event("startup")` and `@app.on_event("shutdown")` decorators are strictly deprecated and prohibited.
- **Dependency Injection Architecture**: Shared resources (database sessions, authentication handlers, external client sessions) MUST be injected into routes using FastAPI's `Depends()` dependency injection mechanism, ensuring clean testability, scoped session cleanup, and loose coupling.
- **Exception Handling & Global Handlers**: Uncaught exceptions MUST NOT leak raw tracebacks to API clients. Applications MUST implement global exception handlers for `RequestValidationError` and domain-specific custom exceptions, returning standardized JSON error envelopes.
- **Mandatory Runtime HTTP Smoke Verification (S7-B Gate)**: Unit tests utilizing unittest mocks alone CANNOT satisfy S7 verification. Any changes introducing or modifying API routes, middleware, or dependency injection providers MUST execute an automated runtime smoke test using `httpx.AsyncClient` or Starlette `TestClient` asserting end-to-end route resolution, payload validation, and HTTP status codes.

## 3. Common Anti-Patterns

#### AP-PY-01: Blocking Synchronous I/O in Async Coroutines
**What it is**: Calling synchronous network or sleep functions inside `async def` handlers.
**Detection signal**: Use of `requests.get()`, `urllib.request`, `time.sleep()`, or synchronous file reading inside `async def`.
**Consequence**: Blocks the Python asyncio event loop, halting all concurrent request processing across the entire worker process.
**Correct alternative**: Use asynchronous libraries (`httpx.AsyncClient()`, `asyncio.sleep()`) or offload via `await asyncio.to_thread(...)`.

#### AP-PY-02: Legacy Pydantic v1 Syntax in v2 Codebase
**What it is**: Using deprecated Pydantic v1 methods and validators in modern Python services.
**Detection signal**: Calls to `.dict()`, `.json()`, `.parse_obj()`, or use of `@validator` instead of `@field_validator`.
**Consequence**: Generates runtime deprecation warnings, degrades validation performance, and triggers type checking incompatibilities.
**Correct alternative**: Adopt modern Pydantic v2 syntax: `.model_dump()`, `.model_dump_json()`, and `@field_validator`.

#### AP-PY-03: Indiscriminate `# type: ignore` Appeasement
**What it is**: Suppressing type checker errors with blanket `# type: ignore` comments instead of properly typing function signatures.
**Detection signal**: Abundant `# type: ignore` comments across route handlers or model definitions.
**Consequence**: Masks silent runtime `AttributeError` and `TypeError` bugs that static typing is intended to eliminate.
**Correct alternative**: Define proper union types, generics, or type narrowing functions to satisfy Mypy/Pyright.

## 4. Audit Checklist
- [ ] No synchronous blocking I/O calls (`requests`, `time.sleep`) exist inside `async def` functions.
- [ ] Pydantic v2 syntax (`model_dump`, `model_validate`, `@field_validator`) is used exclusively.
- [ ] Application lifecycle management is handled via the `@asynccontextmanager` lifespan protocol.
- [ ] Database sessions and client connections are injected via `Depends()`.
- [ ] Global exception handlers sanitize and format all error responses.
- [ ] Real runtime HTTP smoke test passes green using `AsyncClient` or `TestClient` (S7-B Gate).

## 5. Useful References
- [FastAPI Official Documentation](https://fastapi.tiangolo.com/)
- [Pydantic v2 Migration Guide](https://docs.pydantic.dev/latest/migration/)
- [Asyncio Concurrency Best Practices](https://docs.python.org/3/library/asyncio.html)
