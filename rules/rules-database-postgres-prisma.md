# Critical Rules: PostgreSQL + Prisma ORM

This document defines the strict, non-negotiable architectural rules and invariants for projects using PostgreSQL and Prisma ORM 5+ in Node.js / TypeScript environments.

---

## 1. Scope & Target Stack
- **Database**: PostgreSQL 14+ / 16+
- **ORM**: Prisma ORM 5.x+
- **Language**: TypeScript (strict mode)
- **Applicable Files**: `prisma/schema.prisma`, `prisma/migrations/**/*.sql`, `src/**/*.ts`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-PRISMA-01: Migration Script Immutability
- Existing `.sql` migration files in `prisma/migrations/` MUST NEVER be edited once committed.
- All schema alterations MUST be authored in `prisma/schema.prisma` and applied via `npx prisma migrate dev --name <description>`.

### RULE-PRISMA-02: Zero Queries Inside Loops (N+1 Elimination)
- Calling `prisma.<model>.findUnique()` or `findMany()` inside a `for`, `forEach`, `map()`, or `Promise.all()` loop is strictly FORBIDDEN.
- Batch operations MUST use `include`, `select`, or `in` array filters (`where: { id: { in: ids } }`).

### RULE-PRISMA-03: Mandatory Projection over Blind `include`
- Avoid broad `include: { deepRelation: true }` fetching entire nested subtrees.
- Use `select` to limit columns to the minimum required payload, cutting memory overhead and JSON serialization latency.

### RULE-PRISMA-04: Mandatory Multi-Table Transaction Atomicity
- Any business action requiring multi-table mutations or sequential writes MUST be wrapped in `prisma.$transaction([...])` or interactive `$transaction(async (tx) => { ... })`.

### RULE-PRISMA-05: Explicit Indexing on Filter and Join Fields
- Every foreign key relation field, `where` filter field, and sorting column MUST have an explicit `@@index` in `prisma/schema.prisma`.
- Multi-column composite indexes MUST place the most selective field first.

### RULE-PRISMA-06: Serverless Connection Pooling
- Deployments to serverless/edge environments (e.g. Vercel, Cloudflare, AWS Lambda) MUST connect through PgBouncer or Prisma Accelerate.
- Unpooled direct connections are strictly prohibited in serverless environments.

### RULE-PRISMA-07: Singleton PrismaClient Instance
- The application MUST instantiate and export a single global `PrismaClient` instance to prevent connection exhaustion during development hot-reloads.
