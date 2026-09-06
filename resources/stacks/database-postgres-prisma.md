# Stack Pack: PostgreSQL + Prisma

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for PostgreSQL and Prisma ORM. An auditor MUST verify that `package.json` files comply with these ranges to prevent runtime failures and schema sync issues. Ensuring these versions are met is critical for utilizing modern Prisma features like full-text search and JSONB filtering.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| PostgreSQL | 14.0 | None | Postgres < 14 |
| Prisma | 5.0.0 | `@prisma/client` | Prisma 4.x or earlier |
| Node.js | 18.17.0 | None | Node.js < 18 |

## 2. Architecture Rules
These rules define the structural boundaries and data access patterns of a Prisma-backed application. The codebase MUST adhere strictly to these constraints to ensure data integrity, atomicity, and performance. Note: For Upstash Redis constraints (TTL, Keyspace Namespacing) that are often paired with Prisma, refer to the `database-mongo-redis.md` stack pack.

- **Prisma Migration Discipline**: The application MUST NOT alter existing migration files (`.sql` files in `prisma/migrations`) after they have been applied to the database. All schema changes MUST be made in `schema.prisma` and applied via a new migration using `prisma migrate dev`.
- **Index Placement Rules**: The `schema.prisma` file MUST declare indexes (`@@index`) for fields frequently used in `where`, `orderBy`, or `join` operations. When creating composite indexes, the fields MUST be ordered starting with the most selective field first.
- **Atomicity Requirement**: The application MUST use `prisma.$transaction` for any operation that involves multi-table writes or sequential operations that must succeed or fail together. 
- **Connection Pool Limits**: When deploying to serverless environments, the application MUST use an external connection pooler (e.g., PgBouncer) or Prisma Accelerate. Directly connecting serverless functions to PostgreSQL without a pooler exhausts database connections and crashes the application.

## 3. Common Anti-Patterns
The following anti-patterns highlight the most common architectural mistakes made in Prisma-backed applications. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent catastrophic database load and connection exhaustion.

#### AP-PRISMA-01: Prisma N+1 Query Problem
**What it is**: Fetching a list of records and iterating over them to query related records individually, causing an explosion of database queries.
**Detection signal**: A `prisma.model.findUnique()` or `findMany()` call located inside a `for` loop, `map()`, or `Promise.all()`.
**Consequence**: Extremely slow response times as $N$ queries are sent sequentially to the database, exhausting connection pools.
**Correct alternative**: Use Prisma's `include` or `select` parameters to fetch nested relations in a single query, or use `in` operator to fetch multiple records in one go.

#### AP-PRISMA-02: Over-fetching with `include`
**What it is**: Using `include` without limits to fetch deeply nested relational data when only a few fields are needed.
**Detection signal**: A `prisma.model.findMany({ include: { relations: true } })` call that returns massive payloads.
**Consequence**: Excessive memory consumption in the Node.js process and slow database deserialization times.
**Correct alternative**: Use `select` instead of `include` to specify the exact fields needed, or apply pagination (`take`, `skip`) to nested includes.

#### AP-PRISMA-03: Direct Mutation of Migration Files
**What it is**: Modifying a generated `migration.sql` file after it has already been committed and applied to staging or production.
**Detection signal**: A git diff showing changes to an older `.sql` file inside the `prisma/migrations/` directory.
**Consequence**: The migration history drifts between environments, causing `prisma migrate deploy` to fail with checksum errors.
**Correct alternative**: Make changes in `schema.prisma` and run `npx prisma migrate dev --name <description>` to generate a new migration.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a Prisma codebase. Failure to check these items may result in corrupted migration histories, connection pool exhaustion, or severe performance degradation.
- [ ] No `prisma.*` queries exist inside loops or `Promise.all()` maps.
- [ ] Multi-table writes are wrapped in a `prisma.$transaction` block.
- [ ] Foreign keys and heavily queried fields have `@@index` defined in `schema.prisma`.
- [ ] Old migration files have not been modified.
- [ ] Serverless deployments use PgBouncer or Prisma Accelerate for connection pooling.
- [ ] Queries use `select` to limit payload size instead of over-fetching with blind `include`.

## 5. Useful References
The following resources provide authoritative guidance on optimizing database access with Prisma and PostgreSQL. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions regarding database transactions, connection pooling, or migration workflows. Ensuring the application adheres to these best practices is essential for database scalability.
- [Prisma Optimization and N+1](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance): Guide on resolving N+1 queries and optimizing data fetching strategies.
- [Prisma Transactions](https://www.prisma.io/docs/concepts/components/prisma-client/transactions): Best practices for ensuring data atomicity with interactive and nested transactions.
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference): Official reference for all valid schema.prisma properties, types, and attributes.
- [PostgreSQL Documentation on Indexes](https://www.postgresql.org/docs/current/indexes.html): Guide on B-Tree index structure and multi-column index optimization.
