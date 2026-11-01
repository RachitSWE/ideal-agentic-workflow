# Stack Pack: Redis

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Redis key-value storage, caching, distributed locking, and rate limiting across serverless and long-running architectures.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Redis / Valkey Server | Redis 8.0+ / Valkey 8.0 LTS | `ioredis` 5.4+, `@upstash/redis` 1.30+, Lettuce 6.4+, `redis-py` 5.1+ | Redis <= 7.0 |
| Node.js / Serverless | Node 22 LTS / 26 LTS | `@upstash/redis` (serverless/edge) or `ioredis` (long-running) | Node.js < 22 (Node 20 EOL) |
| Java / Spring Boot | Java 21 LTS (Recommended 25 LTS) | `spring-boot-starter-data-redis` 3.4+ / 4.0+ (Lettuce 6.4+) | Java < 21 |
| Python | Python 3.12+ (Recommended 3.14) | `redis[asyncio]` >= 5.1.0 | Python <= 3.10 (EOL October 2026) |

## 2. Architecture Rules
These rules define the memory bounds, keyspace partitioning, and concurrency controls for Redis deployments.

- **Mandatory TTL on All Cache Writes**: Every key written to Redis MUST specify a Time-To-Live (TTL) expiration (`EX`, `PX`, or `EXAT`). Storing keys indefinitely without a TTL is strictly FORBIDDEN unless explicitly managed by a permanent distributed lock or registered coordinator state machine.
- **Hierarchical Keyspace Namespacing**: All Redis keys MUST follow a structured hierarchical delimiter convention: `{namespace}:{tenant_or_guild_id}:{entity_type}:{id}` (e.g., `rate_limit:global:user_9921`, `session:tenant_a:sess_84920`, `guild:details:123456789`). Unprefixed global keys are prohibited.
- **Atomic Sliding-Window Rate Limiting**: High-throughput rate limiters and dispatch throttlers MUST be implemented using atomic Redis Lua scripts with sorted sets (`ZADD`, `ZREMRANGEBYSCORE`, `ZCARD`) or sliding-window algorithms. Non-atomic multi-step read-then-write checks are prohibited due to race conditions.
- **Serverless REST vs. Long-Running TCP Discipline**: Serverless / Edge execution environments (such as Vercel, Cloudflare Workers, AWS Lambda) MUST utilize HTTP REST clients (e.g. `@upstash/redis`) to prevent TCP connection pool starvation. Containerized or daemon services (Spring Boot, FastAPI, Tokio) MUST utilize pooled TCP clients (Lettuce, `redis-py`, `deadpool-redis`).
- **Resilient Fallback on Cache Outages**: Cache access operations MUST fail gracefully. If Redis becomes unavailable, the application MUST degrade gracefully to database reads or in-memory fallback stores rather than throwing uncaught 500 errors.
- **Mandatory Runtime Bootstrap & Caching Smoke Verification (S7-B Gate)**: Unit tests with mocked cache clients alone CANNOT satisfy S7 verification. Any changes introducing or modifying Redis caching, distributed locks, or rate limiters MUST execute an automated runtime smoke test verifying actual key serialization, TTL expiration, and atomic Lua script execution against a real or embedded Redis instance.

## 3. Common Anti-Patterns

#### AP-REDIS-01: Missing TTL on Cache Keys (Unbounded Memory Leaks)
**What it is**: Setting keys in Redis without passing expiration flags.
**Detection signal**: `redis.set(key, value)` without `EX` or `PX` arguments.
**Consequence**: Redis memory grows monotonically until memory exhaustion triggers OOM crashes or uncontrolled cache evictions.
**Correct alternative**: Always specify a TTL: `redis.set(key, value, "EX", 3600)`.

#### AP-REDIS-02: Non-Atomic Rate Limiting (Race Conditions)
**What it is**: Checking current counter with `GET`, evaluating in application code, and updating with `INCR`.
**Detection signal**: Separate `GET` and `INCR`/`EXPIRE` operations without Lua script or atomic pipeline.
**Consequence**: Concurrent requests slip past the rate limit window, flooding downstream services or violating API rate limit SLAs.
**Correct alternative**: Execute an atomic Lua script executing `ZREMRANGEBYSCORE`, `ZADD`, and `EXPIRE` in a single transaction.

#### AP-REDIS-03: TCP Connection Starvation in Serverless Functions
**What it is**: Opening raw TCP Redis connections (`ioredis` or `node-redis`) inside serverless handlers.
**Detection signal**: Instantiating TCP Redis clients on every serverless lambda invocation.
**Consequence**: Rapid scaling exhausts the max clients threshold on the Redis instance, rejecting all subsequent connections.
**Correct alternative**: Use HTTP-based REST Redis clients (e.g. `@upstash/redis`) in serverless environments.

## 4. Audit Checklist
- [ ] Every key write to Redis includes an explicit TTL duration.
- [ ] All keys follow a standardized namespace pattern (`{namespace}:{tenant}:{entity}:{id}`).
- [ ] Rate limiters use atomic Lua scripts or sliding-window sorted sets.
- [ ] Serverless endpoints use REST Redis clients instead of persistent TCP sockets.
- [ ] Redis failures are handled gracefully with fallback mechanisms.
- [ ] Real Redis key write, read, TTL eviction, and Lua script execution verified in S7-B smoke test.

## 5. Useful References
- [Redis Official Commands Documentation](https://redis.io/commands/)
- [Redis Rate Limiting Patterns with Sorted Sets](https://redis.io/glossary/rate-limiting/)
- [Upstash Serverless Redis Best Practices](https://docs.upstash.com/redis)
