# Critical Rules: Python Backend (FastAPI & Async Services)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Python, FastAPI, and asynchronous microservices.

---

## 1. Scope & Target Stack
- **Runtime**: Python 3.11+ (Recommended 3.12+ LTS)
- **Framework**: FastAPI 0.110+, Starlette, Uvicorn
- **Validation**: Pydantic v2 (2.6+)
- **Applicable Files**: `src/**/*.py`, `pyproject.toml`, `requirements.txt`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-PY-01: Absolute Event Loop Non-Blocking Hygiene
- In an `async def` route handler, dependency, or service method, executing synchronous blocking I/O (e.g. `requests.get()`, `urllib3`, `time.sleep()`, synchronous DB drivers) or heavy CPU-bound loops is strictly PROHIBITED.
- Any necessary synchronous library calls or blocking computations MUST be offloaded using `await asyncio.to_thread(...)`.

### RULE-PY-02: Pydantic v2 Strict Modeling & Direct Validation
- All incoming request payloads and outgoing responses MUST be modeled using Pydantic v2 `BaseModel` with strict type annotations.
- Legacy Pydantic v1 methods (`.dict()`, `.parse_obj()`, `@validator`) are FORBIDDEN; use `.model_dump()`, `.model_validate()`, and `@field_validator`.
- Passing around untyped dictionaries (`dict[str, Any]`) across service boundaries is strictly PROHIBITED.

### RULE-PY-03: Modern Lifespan Context Manager Protocol
- Application startup and shutdown resource lifecycles (database pools, HTTP clients, caches) MUST be declared using the modern `@asynccontextmanager` `lifespan` handler on the `FastAPI` instance.
- Deprecated `@app.on_event("startup")` and `@app.on_event("shutdown")` decorators are strictly PROHIBITED.

### RULE-PY-04: Zero Indiscriminate `# type: ignore` Pragmas
- Suppressing static type checker errors with blanket `# type: ignore` comments is prohibited. All models and route handlers must pass strict Mypy/Pyright checks with explicit types.

### RULE-PY-05: Mandatory Runtime HTTP Smoke Verification (S7-B Gate)
- Unittest mocks alone cannot satisfy S7 verification. Any changes introducing or modifying API endpoints, dependencies, or middleware MUST execute an automated runtime smoke test using `httpx.AsyncClient` or `TestClient` verifying route resolution and HTTP response status codes.
