# Stack Pack: MongoDB

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for MongoDB document persistence. An auditor MUST verify that the infrastructure matches these requirements to ensure compatibility with modern driver features, transactional semantics, and BSON serialization limits.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| MongoDB Community / Enterprise | 8.0+ LTS (Recommended 8.0 / 9.0) | Official MongoDB Driver, Mongoose 8+, Spring Data MongoDB 4.3+, Motor | MongoDB <= 7.0 (EOL August 2026) |
| Node.js / TypeScript | Node 22 LTS / 26 LTS, TS 5.5+ | `mongodb` >= 6.8 or `mongoose` >= 8.5 | Node.js < 22 (Node 20 EOL) |
| Java | Java 21 LTS (Recommended 25 LTS) | `spring-boot-starter-data-mongodb` 3.4+ / 4.0+ | Java < 21 |
| Python | Python 3.12+ (Recommended 3.14) | `motor` >= 3.5.0 or `pymongo` >= 4.8 | Python <= 3.10 (EOL October 2026) |

## 2. Architecture Rules
These rules define the structural boundaries, schema validation, and lifecycle hygiene of MongoDB document storage.

- **Schema Validation Authority**: MongoDB collections MUST enforce schema validation either at the database level (using JSON Schema validation) or at the application layer via strict typed schemas (e.g. Mongoose schemas, Pydantic v2 models, or Spring Data annotations). Arbitrary, unvalidated BSON document writes are prohibited.
- **Index Management & Auto-Index Prohibition**: Applications MUST NOT rely on automatic index building on production application startup (e.g., Mongoose `autoIndex: false` in production). Indexes MUST be managed explicitly via migration scripts or declarative reconciliation beans with background index creation.
- **Automated Document TTL Pruning**: Ephemeral collections (such as audit trails, telemetry logs, session data, or transient interaction logs) MUST declare explicit TTL indexes on date fields (e.g., `createdAt` or `timestamp`) to automate document lifecycle expiration and prevent unmanaged storage exhaustion.
- **Bounded Document & Array Storage**: BSON documents have a strict 16MB ceiling. Appending unbounded elements to an embedded array via `$push` without size constraints is strictly FORBIDDEN. Unbounded relationships MUST be partitioned into child collections referencing parent IDs.
- **NoSQL Injection Defense**: User input MUST NEVER be passed directly into query selectors (`db.collection.find(req.query)` or `filter=params`). All query inputs must be parsed, strictly typed, and mapped to concrete fields.
- **Mandatory Runtime Bootstrap & Persistence Smoke Verification (S7-B Gate)**: Unit tests with mocked database drivers or fake in-memory collections alone CANNOT satisfy S7 verification. Any changes touching document persistence MUST execute an automated runtime smoke test exercising a real `create -> read -> delete -> read` cycle against an active test container or embedded instance, verifying real BSON serialization, schema validation, and TTL index reconciliation.

## 3. Common Anti-Patterns

#### AP-MONGO-01: NoSQL Injection Vulnerability
**What it is**: Passing unvalidated request bodies or query dictionaries directly into MongoDB query expressions.
**Detection signal**: `db.collection.find(req.query)` or `User.findOne(req.body)` allowing query operators like `$gt`, `$ne`, or `$regex`.
**Consequence**: Attackers bypass authentication filters, extract unauthorized tenant documents, or execute denial-of-service queries.
**Correct alternative**: Explicitly sanitize and map parameters to typed DTOs: `db.collection.find({ username: sanitize(req.body.username) })`.

#### AP-MONGO-02: Unbounded Array Growth (16MB BSON Limit Breach)
**What it is**: Continuously pushing items into an embedded document array without bounds or retention limits.
**Detection signal**: Frequent `$push` operations without `$slice`, `$sort`, or array bounds checks.
**Consequence**: Document size expands towards the 16MB BSON limit, causing update failures, write amplification, and high read latency.
**Correct alternative**: Move one-to-many relationships exceeding 100 items to a separate collection referencing the parent ID, or cap arrays using `{ $push: { logs: { $each: [entry], $slice: -100 } } }`.

#### AP-MONGO-03: Missing Automated TTL Index on Ephemeral Data
**What it is**: Storing time-sensitive logs, session records, or dispatch events without a TTL index.
**Detection signal**: Date fields used for logging without `{ expireAfterSeconds: ... }` index definitions.
**Consequence**: Unbounded database storage growth, degraded query performance, and expensive manual pruning operations.
**Correct alternative**: Create an automated TTL index: `collection.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 2592000 })` (30 days).

## 4. Audit Checklist
- [ ] All query inputs are validated and mapped to concrete typed attributes to prevent NoSQL injection.
- [ ] Production configurations disable automatic index building on startup (`autoIndex: false`).
- [ ] Ephemeral collections have automated TTL indexes configured for lifecycle management.
- [ ] Embedded arrays are strictly bounded; unbounded relationships use separate collections.
- [ ] MongoDB connection pools are configured with appropriate minimum and maximum pool sizes.
- [ ] Real document persistence cycle passes green against an active or containerized instance (S7-B Gate).

## 5. Useful References
- [MongoDB Schema Design Best Practices](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/)
- [MongoDB Security & NoSQL Injection Prevention](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection)
- [MongoDB TTL Indexes Documentation](https://www.mongodb.com/docs/manual/core/index-ttl/)
