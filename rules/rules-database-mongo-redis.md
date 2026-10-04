# Critical Rules: MongoDB + Redis (Upstash)

This document defines the strict, non-negotiable architectural rules and invariants for projects using MongoDB and Redis / Upstash.

---

## 1. Scope & Target Stack
- **Document DB**: MongoDB 6.0+ (Mongoose or official MongoDB Node/Python driver)
- **Cache / KV**: Redis 6.2+ / Upstash Redis
- **Applicable Files**: `src/models/**/*.ts`, `src/services/**/*.ts`, `src/lib/redis.ts`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-MONGO-01: NoSQL Injection Defense
- Never pass unvalidated user input directly into MongoDB query expressions (`db.collection.find(req.query)` or `User.findOne(req.body)`).
- Input fields MUST be explicitly parsed and mapped into typed query objects.
- Disallow query operators (`$gt`, `$ne`, `$where`, `$regex`) originating from client payloads unless strictly validated.

### RULE-MONGO-02: Bounded Array Storage (16MB Document Safeguard)
- Continuously appending unbounded items to an array in a single MongoDB document via `$push` is FORBIDDEN.
- Arrays MUST either be capped using `$slice` or partitioned into a separate child collection with parent foreign keys.

### RULE-MONGO-03: No Runtime `autoIndex` in Production
- Mongoose `autoIndex` MUST be set to `false` in production configurations.
- Indexes MUST be declared and built via deployment scripts or migration utilities, never on application boot.

### RULE-REDIS-01: Mandatory TTL on All Cache Writes
- Every key written to Redis MUST specify a Time-To-Live (TTL) expiration (`EX`, `PX`, or `expireAt`).
- Storing keys indefinitely without TTL is FORBIDDEN unless explicitly managed by a permanent distributed lock or configuration store.

### RULE-REDIS-02: Structured Keyspace Namespacing
- All Redis keys MUST follow a hierarchical delimiter convention:
  `{namespace}:{tenant_id}:{entity_type}:{id}`
  (e.g., `rate_limit:global:user_9921`, `session:tenant_a:sess_84920`).

### RULE-REDIS-03: REST Client Mandate in Serverless Runtimes
- Serverless / edge functions interacting with Redis MUST use HTTP REST clients (e.g. `@upstash/redis`), preventing connection pool starvation caused by ephemeral TCP handshakes.
