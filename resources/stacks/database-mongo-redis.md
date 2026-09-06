# Stack Pack: MongoDB + Redis

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for MongoDB and Redis (Upstash) applications. An auditor MUST verify that the infrastructure matches these requirements to ensure compatibility with modern driver features. Failing to meet these requirements can lead to connection issues in serverless environments.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| MongoDB | 6.0 | `mongodb` or `mongoose` driver | MongoDB < 5.0 |
| Redis (Upstash) | 6.2 | `ioredis` or `@upstash/redis` | Local-only Redis configs in serverless |
| Node.js | 18.17.0 | None | Node.js < 18 |

## 2. Architecture Rules
These rules define the structural boundaries and hygiene of a NoSQL and Key-Value store architecture. The codebase MUST adhere strictly to these constraints to ensure data consistency and prevent memory exhaustion. Violating these rules commonly results in unstructured data blobs and out-of-memory errors in caching layers.

- **Schema Validation**: MongoDB collections MUST enforce schema validation either at the database level (using JSON Schema validation) or at the application layer (using Mongoose schemas or Pydantic/Zod). Arbitrary document structures without validation are prohibited.
- **Index Creation**: The application MUST NOT rely on automatic index creation in production. Indexes MUST be defined explicitly and created via a deployment script or migration tool, not during application startup.
- **Redis TTL Requirement**: Every key written to Redis (including Upstash) MUST have a Time-To-Live (TTL) configured. Keys MUST NOT be allowed to persist indefinitely unless they are part of a bounded, explicitly managed state machine.
- **Keyspace Namespacing**: Redis keys MUST be prefixed with a clear namespace to prevent keyspace collisions (e.g., `session:user_123`, `rate_limit:ip_456`).
- **Connection Management**: MongoDB connections MUST be cached across serverless invocations (e.g., storing the client in a global variable) to prevent connection exhaustion. Upstash Redis MUST use REST-based clients (`@upstash/redis`) in serverless environments rather than TCP connections.

## 3. Common Anti-Patterns
The following anti-patterns highlight the most common architectural mistakes made in MongoDB and Redis applications. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent NoSQL injection vulnerabilities and out-of-memory incidents.

#### AP-MONGO-01: NoSQL Injection Vulnerability
**What it is**: Passing user input directly into MongoDB query objects without sanitization.
**Detection signal**: Querying the database with an object that directly spreads `req.body` or `req.query`, such as `db.users.find(req.query)`.
**Consequence**: Attackers can inject query operators like `$gt` or `$ne` in the payload (e.g., `?password[$ne]=`) to bypass authentication or extract sensitive data.
**Correct alternative**: Explicitly map and sanitize input fields: `db.users.find({ username: req.body.username })`.

#### AP-REDIS-01: Missing TTL on Cache Keys
**What it is**: Writing data to Redis without setting an expiration time (TTL).
**Detection signal**: Using `redis.set("key", "value")` without passing the `EX` or `PX` arguments.
**Consequence**: The Redis instance eventually runs out of memory, causing evictions of important data or crashing the cache entirely.
**Correct alternative**: Always specify a TTL: `redis.set("key", "value", "EX", 3600)`.

#### AP-MONGO-02: Unbounded Array Growth
**What it is**: Continuously pushing items into an array field within a single MongoDB document.
**Detection signal**: Frequent use of the `$push` operator without `$slice` or `$sort` to cap the array size.
**Consequence**: The document exceeds the 16MB BSON limit, causing the application to crash on updates, and degrades read performance.
**Correct alternative**: Move unbounded one-to-many relationships to a separate collection and reference the parent document ID.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a MongoDB and Redis codebase. Failure to check these items may result in critical security vulnerabilities, unbounded memory usage, and exhausted connection limits.
- [ ] All MongoDB queries strictly sanitize user input and map fields explicitly to prevent NoSQL injection.
- [ ] Unbounded array growth is prevented via separate collections or the `$slice` operator.
- [ ] Every Redis `set` operation includes a TTL parameter.
- [ ] Redis keys use a structured prefix naming convention (e.g., `entity:id`).
- [ ] Serverless environments use global connection caching for MongoDB.
- [ ] Serverless environments use HTTP/REST clients for Upstash Redis instead of TCP connections.

## 5. Useful References
The following resources provide authoritative guidance on building secure and performant applications with MongoDB and Redis. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions regarding schema design, index management, or caching strategies. Utilizing these resources prevents the adoption of brittle NoSQL data models.
- [MongoDB Schema Design Anti-Patterns](https://www.mongodb.com/developer/products/mongodb/schema-design-anti-pattern-summary/): Explains common pitfalls like unbounded arrays and monolithic documents.
- [Upstash Redis Best Practices](https://docs.upstash.com/redis): Guide on utilizing Redis over REST APIs in serverless architectures.
- [Preventing NoSQL Injection](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05.6-Testing_for_NoSQL_Injection): Comprehensive OWASP documentation on sanitizing input before querying a NoSQL database.
- [Redis TTL Documentation](https://redis.io/commands/expire/): Information on key expiration and eviction policies.
