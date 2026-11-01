# Critical Rules: MongoDB

This document defines the strict, non-negotiable architectural rules and invariants for projects using MongoDB document persistence.

---

## 1. Scope & Target Stack
- **Document DB**: MongoDB 6.0+ (Mongoose 8+, Spring Data MongoDB, or Motor / Async Python driver)
- **Applicable Files**: Model definitions, document repositories, persistence services, and migration scripts.

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-MONGO-01: NoSQL Injection Defense
- Never pass unvalidated user input directly into MongoDB query expressions (`db.collection.find(req.query)` or `User.findOne(req.body)`).
- Input fields MUST be explicitly parsed and mapped into typed query objects.
- Disallow query operators (`$gt`, `$ne`, `$where`, `$regex`) originating from client payloads unless strictly validated against a strict schema.

### RULE-MONGO-02: Bounded Array Storage (16MB Document Safeguard)
- Continuously appending unbounded items to an array in a single MongoDB document via `$push` is strictly FORBIDDEN.
- Arrays MUST either be capped using `$slice` or partitioned into a separate child collection with parent foreign keys.

### RULE-MONGO-03: No Runtime `autoIndex` in Production
- Automatic index generation on application startup (e.g. Mongoose `autoIndex: true`) MUST be disabled in production configurations.
- Indexes MUST be declared and built via deployment scripts, migration utilities, or dedicated reconciliation beans before application traffic is served.

### RULE-MONGO-04: Mandatory TTL Index on Ephemeral Collections
- Ephemeral collections (such as interaction logs, dispatch logs, audit trails, and telemetry) MUST configure automated TTL indexes on date fields (`createdAt` or `timestamp`) to enforce lifecycle retention and prevent unmanaged disk bloat.

### RULE-MONGO-05: Mandatory Runtime Persistence Smoke Verification (S7-B Gate)
- Mocked database drivers or fake in-memory stores alone cannot satisfy S7 verification. Any changes modifying document schemas or queries MUST verify a real `create -> read -> delete` cycle against an active test container or embedded instance.
