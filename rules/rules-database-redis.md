# Critical Rules: Redis

This document defines the strict, non-negotiable architectural rules and invariants for projects using Redis for caching, distributed locking, session management, and rate limiting.

---

## 1. Scope & Target Stack
- **Cache / KV**: Redis 6.2+ (Recommended 7.2+), Upstash Redis
- **Applicable Files**: Redis client configurations, cache utilities, rate limiting middleware, distributed locks.

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-REDIS-01: Mandatory TTL on All Cache Writes
- Every key written to Redis MUST specify a Time-To-Live (TTL) expiration (`EX`, `PX`, or `expireAt`).
- Storing keys indefinitely without a TTL is strictly FORBIDDEN unless explicitly managed by a permanent distributed lock or registered coordinator state machine.

### RULE-REDIS-02: Structured Keyspace Namespacing
- All Redis keys MUST follow a standardized hierarchical delimiter convention:
  `{namespace}:{tenant_id}:{entity_type}:{id}`
  (e.g., `rate_limit:global:user_9921`, `session:tenant_a:sess_84920`, `guild:details:123456789`).
- Unprefixed global keys are prohibited to prevent keyspace collisions across multi-tenant deployments.

### RULE-REDIS-03: Atomic Sliding-Window Rate Limiting
- High-frequency rate limiters and dispatch throttlers MUST be implemented using atomic Redis Lua scripts with sorted sets (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) or atomic pipelines.
- Non-atomic read-then-write checks (`GET` followed by application check followed by `SET`) are strictly FORBIDDEN due to concurrent race conditions.

### RULE-REDIS-04: Serverless REST vs. Long-Running TCP Discipline
- Serverless and Edge runtimes (Vercel, AWS Lambda, Cloudflare Workers) MUST use HTTP REST clients (e.g. `@upstash/redis`) to prevent connection pool exhaustion caused by ephemeral TCP handshakes.
- Containerized long-running services (Spring Boot, FastAPI, Tokio) MUST utilize bounded, pooled TCP clients (Lettuce, `redis-py`, `deadpool-redis`).

### RULE-REDIS-05: Mandatory Runtime Cache Smoke Verification (S7-B Gate)
- Mocked Redis clients alone cannot satisfy S7 verification. Any changes introducing or modifying Redis caching, distributed locks, or rate limiters MUST execute an automated runtime smoke test verifying actual key serialization, TTL expiration, and atomic Lua script execution against a real or embedded Redis instance.
