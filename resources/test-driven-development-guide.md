# Test-Driven Development (TDD) Guide for Agentic Workflows

## 1. Overview
Test-Driven Development (TDD) is a fundamental engineering discipline within `ideal-agentic-workflow`.
Writing tests before or alongside implementation code guarantees:
1. Precise requirement boundaries.
2. Immediate verification feedback during S7.
3. Permanent regression prevention.
4. Clean, modular, decoupled architecture.

---

## 2. The Agentic Red-Green-Refactor Lifecycle

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   RED PHASE     │  ──>  │   GREEN PHASE   │  ──>  │ REFACTOR PHASE  │
│ Write failing   │       │ Implement min   │       │ Eliminate APs,  │
│ tests in S6     │       │ code to pass S7 │       │ clean, optimize │
└─────────────────┘       └─────────────────┘       └─────────────────┘
         ▲                                                   │
         └─────────────────── Next Task ─────────────────────┘
```

1. **Red**: For each item in `task.md`, define the test cases first (or co-locate them in the task commit). The test MUST fail initially or define the expected behavior contract.
2. **Green**: Write the minimal, cleanest production implementation that satisfies the test contract. No extraneous code or over-engineering.
3. **Refactor**: Verify against all anti-patterns (AP-001 through AP-004). Clean up types, ensure comments meet standards, and verify performance.

---

## 3. The Testing Pyramid

```
       /\
      /  \      E2E / Playwright / Gametest
     /----\     (Critical flows only: ~10%)
    /      \
   /--------\   Integration / Slice Tests / Testcontainers
  /          \  (DataJpa, WebMvc, HTTP integration: ~30%)
 /------------\
/              \ Unit Tests / Isolated Logic
──────────────── (Pure functions, domain models, validations: ~60%)
```

### 3.1 Unit Tests (Base Layer)
- Fast (< 5ms per test), zero I/O, zero network, zero database calls.
- Validates pure domain rules, business calculations, validators, and transformers.

### 3.2 Slice / Integration Tests (Middle Layer)
- Verifies real framework wiring (e.g. `@DataJpaTest`, `@WebMvcTest`, Axum router test).
- Uses real databases via Testcontainers or ephemeral in-memory databases.
- Avoids brittle "mock everything" cascades where tests test mocks rather than system behavior.

### 3.3 End-to-End Tests (Top Layer)
- Exercises complete vertical slices from user action or API endpoint to database and back.

---

## 4. Test Naming & Assertion Conventions

### Naming Formula:
`should_[ExpectedBehavior]_when_[ConditionOrInput]`
or
`methodName_GivenCondition_ReturnsExpectedResult`

**Examples**:
- `should_reject_order_when_stock_is_insufficient()`
- `should_throw_resource_not_found_when_user_id_does_not_exist()`
- `create_user_with_duplicate_email_returns_409_conflict()`

### The AAA Pattern:
Every test MUST follow the Arrange-Act-Assert pattern:
```typescript
it('should calculate discount accurately for premium members', () => {
  // Arrange
  const user = createTestUser({ tier: 'PREMIUM' });
  const cart = createTestCart({ total: 100 });

  // Act
  const discount = calculateDiscount(user, cart);

  // Assert
  expect(discount).toBe(20);
});
```

---

## 5. Mocking Discipline & Anti-Mocking Rules

1. **Never mock what you do not own**: Wrap third-party services in domain adapter interfaces before mocking.
2. **Prefer In-Memory or Testcontainers over Fake Repositories**: Mocking repositories often masks N+1 queries, missing SQL indexes, and transaction rollback failures.
3. **Never verify mock internal calls when you can assert return values**: Assert outputs and observable state changes, not call counts of private methods.

---

## 6. The Closed-Loop Verification Illusion & S7-B Runtime Smoke Gate

### 6.1 The Closed-Loop Verification Illusion
In agentic coding, an agent can easily fall into the **Closed-Loop Verification Illusion**: authoring implementation code and simultaneously writing pure unit tests (e.g. `@ExtendWith(MockitoExtension.class)` or `jest.mock()`) that mock out all collaborators.
Because the tests only assert against the agent's own mocked assumptions, the test suite reports 100% green passes. However, in production or real runtime environments, the application crashes immediately due to:
- Bean wiring failures (`UnsatisfiedDependencyException`, circular injection, missing Spring annotations).
- Broken database schema mappings, invalid sequence generators, and missing Flyway columns.
- Broken REST controller routing, missing `@RequestBody`, or Jackson deserialization crashes.
- Offline `localStorage` fallbacks masking broken backend API contracts.

### 6.2 Mandatory S7-B Runtime Smoke Gate Requirements
To eliminate this illusion, the S7 phase mandates Tier 3B: Runtime Smoke Verification Gate before submitting code to S8 peer review:
1. **Spring Boot ApplicationContext Bootstrap**:
   - Backend services MUST include an automated runtime smoke test:
     ```java
     @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
     class ApplicationSmokeTest {
         @Autowired
         private ApplicationContext context;

         @Test
         void contextLoads() {
             assertThat(context).isNotNull();
         }
     }
     ```
   - Proves all beans, security filter chains, and configuration properties wire cleanly without runtime exceptions.
2. **Real Persistence Lifecycle Verification**:
   - Repositories MUST execute a real lifecycle cycle: `create -> read -> delete -> read` against an embedded database or Testcontainers.
   - Proves table definitions, sequences, constraints, and entity mappings actually function in SQL.
3. **Frontend Component Mount & Contract Verification**:
   - Web frontend tasks MUST execute render/mount tests asserting that components mount without uncaught DOM exceptions and user interactions trigger the API client.
   - `tsc --noEmit` validates static types only; it cannot substitute for automated render tests.
