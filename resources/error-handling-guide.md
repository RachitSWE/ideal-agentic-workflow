# Production Error Handling Guide Across Technology Stacks

## 1. Overview
Robust error handling separates amateur code from production-grade systems.
This guide outlines the standard architectural patterns for error handling across every stack supported by `ideal-agentic-workflow`.
Agents MUST adhere to these blueprints during S6 Coding and verify them during S8 Code Review.

---

## 2. Universal Principles
1. **Never Swallow Errors**: Empty `catch {}`, bare `except: pass`, or ignoring returned error tokens is strictly forbidden (AP-004).
2. **Context-Rich Propagation**: When propagating errors upward, attach contextual metadata (e.g. entity ID, requested operation, user ID) without leaking sensitive secrets.
3. **Structured API Responses**: Public API endpoints must never leak raw stack traces or database errors to clients. Use RFC 7807 `ProblemDetail` or structured JSON envelopes.
4. **Idempotency on Failure**: Failed mutations must either completely roll back (transactions) or be safely retryable without causing duplicate state.

---

## 3. Stack-Specific Blueprints

### 3.1 Rust Backend (`web-backend-rust`)
- **Domain Errors**: Define explicit domain error enums using `thiserror`:
  ```rust
  #[derive(thiserror::Error, Debug)]
  pub enum OrderError {
      #[error("order {0} not found")]
      NotFound(String),
      #[error("insufficient stock for item {0}")]
      InsufficientStock(String),
      #[error(transparent)]
      Database(#[from] sqlx::Error),
  }
  ```
- **HTTP Mapping**: Implement Axum's `IntoResponse` for the domain error to convert into HTTP status codes:
  ```rust
  impl IntoResponse for OrderError {
      fn into_response(self) -> Response {
          let (status, msg) = match &self {
              OrderError::NotFound(_) => (StatusCode::NOT_FOUND, self.to_string()),
              OrderError::InsufficientStock(_) => (StatusCode::CONFLICT, self.to_string()),
              OrderError::Database(_) => (StatusCode::INTERNAL_SERVER_ERROR, "internal database error".into()),
          };
          (status, Json(serde_json::json!({ "error": msg }))).into_response()
      }
  }
  ```

---

### 3.2 Java Spring Boot (`web-backend-java-spring`, `database-postgres-hibernate-flyway`)
- **Centralized Exception Handling**: Use `@RestControllerAdvice` implementing RFC 7807:
  ```java
  @RestControllerAdvice
  public class GlobalExceptionHandler {
      @ExceptionHandler(ResourceNotFoundException.class)
      public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
          ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
          problem.setTitle("Resource Not Found");
          problem.setProperty("timestamp", Instant.now());
          return problem;
      }

      @ExceptionHandler(OptimisticLockingFailureException.class)
      public ProblemDetail handleOptimisticLock(OptimisticLockingFailureException ex) {
          ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, "Resource was modified concurrently.");
          problem.setTitle("Concurrency Conflict");
          return problem;
      }
  }
  ```

---

### 3.3 Next.js / TypeScript App Router (`web-nextjs-turborepo`)
- **Server Action Result Envelope**: Wrap Server Action mutations in a discriminated union:
  ```ts
  export type ActionResult<T> = 
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } };

  export async function createItem(input: unknown): Promise<ActionResult<Item>> {
    const parsed = ItemSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', fieldErrors: parsed.error.flatten().fieldErrors }
      };
    }
    try {
      const item = await db.item.create({ data: parsed.data });
      return { success: true, data: item };
    } catch (err) {
      return { success: false, error: { code: 'DATABASE_ERROR', message: 'Failed to create item' } };
    }
  }
  ```

---

### 3.4 Python AI / FastAPI (`web-backend-python-ai`)
- **Pydantic Validation & Exception Handlers**:
  ```python
  from fastapi import FastAPI, Request, status
  from fastapi.responses import JSONResponse
  from pydantic import ValidationError

  class DomainException(Exception):
      def __init__(self, message: str, code: str = "DOMAIN_ERROR"):
          self.message = message
          self.code = code

  @app.exception_handler(DomainException)
  async def domain_exception_handler(request: Request, exc: DomainException):
      return JSONResponse(
          status_code=status.HTTP_400_BAD_REQUEST,
          content={"error": {"code": exc.code, "message": exc.message}},
      )
  ```

---

### 3.5 Minecraft Modding (`mc-fabric`, `mc-neoforge`)
- **Network Packet Decoding**: Always wrap custom packet decoders in boundary guards. If a malformed packet is received, log a warning and disconnect the invalid client safely rather than throwing an uncaught exception that crashes the entire server loop.
- **Mixin Failure Prevention**: Never assume injected methods or fields are non-null. Always check for nullability before executing mixin hooks.
