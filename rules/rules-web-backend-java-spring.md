# Critical Rules: Java Spring Boot Backend

This document defines the strict, non-negotiable architectural rules and invariants for projects using Java 17/21+, Spring Boot 3+, Spring Security 6, and Jakarta EE.

---

## 1. Scope & Target Stack
- **Framework**: Spring Boot 3.0+ / 3.3+
- **Language**: Java 17 LTS / 21 LTS
- **Security**: Spring Security 6+
- **Applicable Files**: `src/main/java/**/*.java`, `pom.xml`, `build.gradle`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-SPRING-01: Transaction Boundary Placement
- `@Transactional` MUST ONLY be placed on Service layer classes or methods.
- Placing `@Transactional` on Controllers or Repositories is strictly FORBIDDEN.
- Transactions wrap business units of work, not HTTP transport layers.

### RULE-SPRING-02: DTO ↔ Entity Boundary Isolation
- Database `@Entity` classes MUST NEVER be returned directly from `@RestController` endpoints or accepted as `@RequestBody`.
- All HTTP input and output MUST be mapped to immutable Data Transfer Objects (Java records or dedicated DTOs).

### RULE-SPRING-03: Stateless Singleton Beans
- Beans with default Singleton scope (`@Service`, `@Component`, `@Controller`) MUST be completely stateless.
- Declaring mutable instance variables inside singleton beans introduces severe multi-threaded race conditions and cross-request contamination.

### RULE-SPRING-04: Strict Security Filter Chain
- The `SecurityFilterChain` bean MUST explicitly define authorization rules:
  - Whitelist public endpoints with `permitAll()`.
  - Secure all other endpoints with `anyRequest().authenticated()`.
  - Prefer `@PreAuthorize` with SpEL for granular method-level authorization over legacy `@Secured`.

### RULE-SPRING-05: Global Exception Handling via RFC 7807
- Controllers MUST NOT catch general exceptions and return ad-hoc `ResponseEntity` with error strings.
- All domain and infrastructure exceptions MUST be caught centrally using `@RestControllerAdvice` and formatted using RFC 7807 `ProblemDetail`.

### RULE-SPRING-06: No Raw Null from Repositories
- Repositories querying single entities MUST return `Optional<T>`. Returning raw `null` is FORBIDDEN.
- Service layers MUST unwrap optionals using `.orElseThrow(() -> new ResourceNotFoundException(...))`.

### RULE-SPRING-07: Constructor Injection Exclusivity
- Field injection using `@Autowired` on private fields is FORBIDDEN.
- All dependencies MUST be injected via constructor injection (using explicit constructors or Lombok `@RequiredArgsConstructor`).
