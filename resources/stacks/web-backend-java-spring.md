# Stack Pack: Java Spring Boot Backend

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Spring Boot and Java backend applications. An auditor MUST verify that `pom.xml` or `build.gradle` files comply with these ranges to prevent runtime failures and dependency conflicts. Enforcing these versions ensures the application benefits from modern Jakarta EE namespaces and security features.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Java | 17 (21 recommended) | None | Java < 17 |
| Spring Boot | 3.0.0 | Jakarta EE 10+ | javax.* namespaces |
| Spring Security | 6.0.0 | Spring Boot 3+ | WebSecurityConfigurerAdapter (deprecated) |

## 2. Architecture Rules
These rules define the structural boundaries of a Spring Boot backend. The codebase MUST adhere strictly to these constraints to ensure proper transaction management, security, and separation of concerns. Violations of these rules directly lead to security vulnerabilities and unstable transaction lifecycles.

- **Transactional Boundaries**: The `@Transactional` annotation MUST only be applied at the Service layer. It MUST NOT be applied at the Controller layer (which handles HTTP) or the Repository layer (which handles individual queries), ensuring transactions wrap entire business operations.
- **DTO ↔ Entity Mapping**: Entities MUST NOT leak into the Controller layer. The Service layer MUST map Entities to Data Transfer Objects (DTOs) before returning data to the Controller, preventing over-posting attacks and accidental data exposure.
- **Spring Security Filter Chain**: The `SecurityFilterChain` bean MUST be ordered correctly. Public endpoints MUST be explicitly permitted (`permitAll()`), and all other endpoints MUST require authentication (`anyRequest().authenticated()`).
- **Authorization Annotations**: Prefer `@PreAuthorize` over `@Secured` for method-level security, as `@PreAuthorize` supports Spring Expression Language (SpEL) for complex rules (e.g., `@PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")`).
- **Exception Handling**: The application MUST use a `@ControllerAdvice` or `@RestControllerAdvice` class to handle exceptions globally. Controllers MUST NOT contain excessive `try-catch` blocks returning raw `ResponseEntity` objects.

## 3. Common Anti-Patterns
The following anti-patterns highlight the most common architectural mistakes made in Spring Boot applications. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent database performance collapse and runtime null pointer exceptions.

#### AP-SPRING-01: JPA N+1 Query Problem
**What it is**: Fetching a list of entities and then lazily loading a related entity for each item in the list, resulting in $N+1$ database queries instead of 1.
**Detection signal**: A `@OneToMany` or `@ManyToMany` relationship without a `fetch = FetchType.LAZY` default, combined with accessing the collection in a loop, or omitting `@BatchSize` or `JOIN FETCH` in the JPQL query.
**Consequence**: Severe database performance degradation under load as one API call triggers hundreds of queries.
**Correct alternative**: Use `JOIN FETCH` in JPQL queries, configure `@BatchSize` on collections, or use EntityGraphs to fetch related data in a single query.

#### AP-SPRING-02: Returning Null from Repositories
**What it is**: A repository method or service returning a raw `null` value when an entity is not found, forcing the caller to perform null checks.
**Detection signal**: A method signature like `User findByEmail(String email)` returning `null` if the user does not exist.
**Consequence**: High risk of `NullPointerException` (NPE) in downstream logic if a null check is missed.
**Correct alternative**: Return `Optional<User>` from the repository and use functional methods like `.orElseThrow()` in the service layer.

#### AP-SPRING-03: Singleton Bean Scope Misuse
**What it is**: Injecting stateful, request-scoped data into a default Singleton-scoped Spring bean.
**Detection signal**: A `@Service` or `@Component` class containing mutable instance variables (e.g., `private User currentUser;`) that are modified during a request.
**Consequence**: Severe race conditions and cross-user data leakage, as the same bean instance is shared across all concurrent HTTP threads.
**Correct alternative**: Keep singleton beans stateless. If state is required, inject the state via method parameters or use `@RequestScope` for the bean.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a Spring Boot codebase. Failure to check these items may result in broken transaction boundaries, security vulnerabilities, or severe database performance degradation.
- [ ] `@Transactional` is used exclusively on Service layer classes or methods.
- [ ] Controllers accept and return DTOs, not database Entities.
- [ ] `SecurityFilterChain` explicitly configures `permitAll()` for public routes and requires authentication for everything else.
- [ ] `@PreAuthorize` is used for method-level security instead of `@Secured`.
- [ ] `@OneToMany` and `@ManyToMany` relationships are audited for N+1 vulnerabilities (using `JOIN FETCH` or `@BatchSize`).
- [ ] Repositories return `Optional<T>` for single-entity queries.
- [ ] Global exception handling is implemented via `@RestControllerAdvice`.
- [ ] Singleton beans (`@Service`, `@Component`) have no mutable instance variables.

## 5. Useful References
The following resources provide authoritative guidance on building scalable and secure applications with Java and Spring Boot. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions, particularly involving JPA performance or Spring Security filter chains. Reviewing these links regularly ensures that the application remains aligned with modern Spring ecosystem practices.
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/): The primary source of truth for configuration and auto-configuration details.
- [Spring Security Architecture](https://spring.io/guides/topicals/spring-security-architecture): In-depth guide on the security filter chain and authentication providers.
- [Hibernate N+1 Problem](https://vladmihalcea.com/n-plus-1-query-problem/): Detailed explanation of how to detect and resolve N+1 queries using `JOIN FETCH` and `@BatchSize`.
- [Spring Data JPA Documentation](https://docs.spring.io/spring-data/jpa/reference/): Authoritative guide on repository patterns, projections, and entity lifecycle.
