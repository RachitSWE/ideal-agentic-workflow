# Critical Rules: Python AI & RAG Backend

This document defines the strict, non-negotiable architectural rules and invariants for projects using Python 3.10+, FastAPI, AsyncIO, Pydantic v2, and Vector Database/RAG frameworks.

---

## 1. Scope & Target Stack
- **Framework**: FastAPI, Uvicorn
- **Language**: Python 3.10+
- **Data Validation**: Pydantic v2+
- **Applicable Files**: `src/**/*.py`, `app/**/*.py`, `requirements.txt`, `pyproject.toml`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-PYAI-01: Zero Blocking in Async Event Loops
- Inside an `async def` route or function, executing synchronous blocking operations (e.g., `requests.get()`, `time.sleep()`, synchronous file reading, synchronous database queries) is strictly FORBIDDEN.
- All blocking operations MUST either be executed via an async client (`httpx.AsyncClient`, `aiofiles`) or offloaded to a thread pool via `asyncio.to_thread(func, *args)`.

### RULE-PYAI-02: Exact Dependency Pinning for AI Frameworks
- All AI dependencies (e.g., `langchain`, `llamaindex`, `openai`, `chromadb`, `pinecone-client`) in `requirements.txt` or `pyproject.toml` MUST be pinned to exact versions (`==`).
- Loose dependency ranges (`>=`, `~=`) for AI libraries are strictly FORBIDDEN due to high frequency of breaking API changes.

### RULE-PYAI-03: Zero Hardcoded API Keys & Secrets
- Instantiating AI clients with literal key strings (`api_key="sk-..."`) is a CRITICAL SECURITY VIOLATION.
- All credentials MUST be loaded, validated, and type-checked at startup using `pydantic_settings.BaseSettings`.

### RULE-PYAI-04: Strict Vector Index Dimension Parity
- Vector collection definitions and index creation scripts MUST match the exact output dimension of the active embedding model (e.g. 1536 for OpenAI `text-embedding-3-small`, 3072 for `text-embedding-3-large`).
- Embedding configuration must derive from a single unified configuration class.

### RULE-PYAI-05: Pydantic v2 Modern Idioms
- Deprecated Pydantic v1 methods (`@validator`, `@root_validator`, `.dict()`, `.parse_obj()`) are FORBIDDEN.
- Code MUST use `@field_validator`, `@model_validator`, `.model_dump()`, and `.model_validate()`.

### RULE-PYAI-06: Complete Type Annotations
- Every function, method parameter, and return value MUST have explicit type hints.
- The use of untyped `Any` is FORBIDDEN except for raw unparsed third-party JSON dictionaries.
