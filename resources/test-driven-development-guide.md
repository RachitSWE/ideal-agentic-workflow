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
