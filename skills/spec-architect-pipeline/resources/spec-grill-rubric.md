# SP2 System Design Grilling Rubric (10–12 Question Interview)

## 1. Overview
The SP2 Grilling phase bridges abstract feature ideas into concrete, hardened architecture.
Before drafting any specification, the agent MUST interview the user using 10–12 targeted system design and architecture questions.
Questions MUST be asked sequentially or in focused logical batches using `ask_question`.
For every question, the agent MUST formulate a concrete recommendation based on the repository's stack, `GEMINI.md`, and architectural invariants.

---

## 2. The 12 Architectural Dimensions

### Question 1: Feature Scope & Core User Journey
- **Objective**: Pin down exact functional boundaries and define what is explicitly in-scope versus out-of-scope (YAGNI).
- **Key Probe**: "What is the primary trigger, user flow, and expected end state of this feature? What should be explicitly deferred to future iterations?"

### Question 2: API Protocol & Interface Contracts
- **Objective**: Select communication protocol and payload formatting.
- **Key Probe**: "How will this feature be accessed? (e.g., RESTful HTTP endpoints, Next.js Server Actions, gRPC, CLI command, or internal domain events?) What are the proposed payload formats?"

### Question 3: Data Model & Entity Relations
- **Objective**: Design entity schema, normalization, and relational cardinality.
- **Key Probe**: "What entities are being introduced or modified? What are their relationships (1:1, 1:N, N:M)? Which fields are required, unique, or indexed?"

### Question 4: Persistence Provider & Migration Authority
- **Objective**: Align with database engine and migration framework.
- **Key Probe**: "Which persistence layer handles this? (e.g., PostgreSQL with Hibernate 6 + Flyway migrations, Prisma ORM, or MongoDB?) What is the table naming convention and primary key generation strategy?"

### Question 5: Concurrency, Locking & State Atomicity
- **Objective**: Guard against race conditions, double-writes, and deadlocks.
- **Key Probe**: "Could concurrent requests or workers modify this state simultaneously? Should we employ Optimistic Locking (`@Version`), Pessimistic Locking (`SELECT FOR UPDATE`), or distributed Redis locks?"

### Question 6: Caching Topology & Invalidation Strategy
- **Objective**: Protect database and define cache-aside / TTL policies.
- **Key Probe**: "Does this feature require caching? If so, what is the cache invalidation trigger, key namespace, and mandatory TTL duration?"

### Question 7: Security Boundaries & Authorization Matrix
- **Objective**: Prevent IDOR/BOLA, injection, and privilege escalation.
- **Key Probe**: "Who is permitted to invoke this capability? How are user ownership and tenant boundaries enforced at the service and query layers?"

### Question 8: Input Validation & Boundary Sanitization
- **Objective**: Block malicious or malformed payloads at the edge.
- **Key Probe**: "How will incoming requests be validated? (e.g., Zod schemas, Jakarta `@Valid`, Pydantic v2?) What are the validation constraints on edge values?"

### Question 9: Error Handling & Degradation Protocols
- **Objective**: Standardize failure responses and avoid silent swallows.
- **Key Probe**: "What are the known failure modes (not found, conflict, downstream timeout)? How should errors be formatted (e.g., RFC 7807 `ProblemDetail`)?"

### Question 10: Asynchronous Processing & Background Jobs
- **Objective**: Decouple long-running operations from synchronous request threads.
- **Key Probe**: "Are there tasks that should be processed asynchronously (e.g., email notification, event emission, bulk calculation)? Which worker or event bus mechanism should be used?"

### Question 11: Testing & Verification Boundaries
- **Objective**: Establish the TDD testing plan and test granularity.
- **Key Probe**: "What are the primary unit and slice tests for this feature? Which mock/in-memory adapters or Testcontainers will be used to verify behavior without brittle cascades?"

### Question 12: Deployment & Backward Compatibility
- **Objective**: Ensure seamless rollout and migration reversibility.
- **Key Probe**: "Does this feature alter existing database columns or API contracts? Is a multi-step rollout (expand-and-contract) required to prevent breaking existing clients?"

---

## 3. Output Logging
All questions, user selections, and agreed architecture decisions MUST be recorded in:
`.agents/specs/session-[SHA]/grill/grill-log.md`
