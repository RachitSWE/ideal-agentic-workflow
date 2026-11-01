# Stack Pack: Java Backend (Spring Boot)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Java enterprise backend applications built on Spring Boot, Virtual Threads, and modern OpenJDK runtimes.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Java Development Kit (JDK) | Java 21 LTS (Recommended 25 LTS) | OpenJDK, Eclipse Temurin, Amazon Corretto | Java < 21 |
| Spring Boot Framework | 3.4.0+ (Recommended 4.0+) | `spring-boot-starter-web`, `spring-boot-starter-security` | Spring Boot <= 3.2 (OSS EOL) |
| Spring Security | 6.3+ / 7.0+ | `SecurityFilterChain` bean declarations | Legacy `WebSecurityConfigurerAdapter` |
| Build Tool | Gradle 8.8+ or Maven 3.9+ | Java 21/25 toolchains | Gradle < 8.5, Maven < 3.8 |

## 2. Architecture Rules
These rules define the structural boundaries, thread concurrency models, type safety, and clean code governance for Java backend architectures.

- **Strictly 1-Class-Per-File Invariant**: Every class, interface, enum, record, and custom exception MUST reside in its own dedicated `.java` file whose name strictly matches the type declaration (e.g. `UserResponse.java`, `PersonnelHierarchy.java`). Static nested classes, inner classes, secondary top-level classes, or inline helper records inside another class file are strictly FORBIDDEN in production code (`src/main/java`).
- **Zero `@SuppressWarnings` Compiler Appeasement Policy**: Developers and agents MUST NEVER introduce `@SuppressWarnings` annotations (such as `"unchecked"`, `"rawtypes"`, `"deprecation"`, or `"serial"`) to mask compiler diagnostics or linter warnings. Code must be written with explicit generics, type bounds, and modern API contracts.
- **Virtual Threads (Project Loom) Carrier Thread Hygiene**: When virtual threads are enabled (`spring.threads.virtual.enabled: true`), native carrier threads MUST NOT be pinned or blocked. Monolithic `synchronized` blocks and `Thread.sleep` calls on carrier threads are prohibited; use `ReentrantLock`, `CompletableFuture`, and non-blocking asynchronous primitives.
- **Concrete Type Deserialization on Outbound REST Clients**: Outbound HTTP/REST clients (Spring `RestClient`, `WebClient`) MUST NEVER deserialize responses directly into abstract classes or ASTs (such as `JsonNode.class` or `Map<String, Object>`). Abstract deserialization triggers Jackson classpath conflicts and runtime type errors. Clients must deserialize into concrete DTOs or retrieve raw payloads as `String.class` and parse using the application-managed `ObjectMapper`.
- **Stateless Security Filter Chains**: Authentication filters MUST be declared as independent beans returning `SecurityFilterChain`. Sessions must be stateless (`SessionCreationPolicy.STATELESS`), with identity propagation managed via signed JWTs or opaque tokens.
- **Mandatory Runtime ApplicationContext Bootstrap Smoke Gate (S7-B Gate)**: Unit tests with `@ExtendWith(MockitoExtension.class)` alone CANNOT satisfy S7 verification. Any changes modifying bean definitions, `@Autowired` dependencies, configurations, or repository interfaces MUST execute an automated `@SpringBootTest` smoke test asserting that the Spring `ApplicationContext` initializes successfully without `UnsatisfiedDependencyException` or bean wiring failures.

## 3. Common Anti-Patterns

#### AP-JAVA-01: Breaking the Strictly 1-Class-Per-File Invariant
**What it is**: Declaring inner static helper classes, enum constants, or auxiliary records inside a service or controller `.java` file.
**Detection signal**: Multiple `class`, `record`, or `enum` declarations inside a single `.java` file in `src/main/java`.
**Consequence**: Degrades code maintainability, complicates unit test mocking, breaks IDE navigation, and violates strict modularity.
**Correct alternative**: Extract each inner class, record, or enum into its own dedicated file matching the type name.

#### AP-JAVA-02: Carrier Thread Pinning in Virtual Threads
**What it is**: Using synchronized methods or synchronized blocks while performing I/O on virtual threads.
**Detection signal**: `synchronized (lock) { doHttpCall(); }` or `Thread.sleep(...)` executed inside a virtual thread worker.
**Consequence**: Virtual threads pin the underlying OS carrier thread, starving the scheduler and negating the scalability benefits of Project Loom.
**Correct alternative**: Replace `synchronized` with `java.util.concurrent.locks.ReentrantLock` and use non-blocking asynchronous I/O.

#### AP-JAVA-03: Abstract Type Deserialization on REST Clients
**What it is**: Deserializing HTTP responses directly into Jackson `JsonNode.class` or abstract classes via Spring `RestClient`.
**Detection signal**: `.body(JsonNode.class)` or `.toEntity(JsonNode.class)` on `RestClient` calls.
**Consequence**: Jackson 2 / Jackson 3 library version collisions trigger runtime `Type definition error` crashes.
**Correct alternative**: Deserialize into a typed concrete record/DTO, or read as `String.class` and parse with the configured `ObjectMapper`.

## 4. Audit Checklist
- [ ] Every class, record, enum, and interface resides in its own dedicated `.java` file.
- [ ] Zero occurrences of `@SuppressWarnings` exist across production source files.
- [ ] Virtual thread pathways avoid `synchronized` blocks and carrier thread pinning.
- [ ] Outbound REST clients deserialize into concrete DTOs rather than `JsonNode`.
- [ ] Security configuration uses `SecurityFilterChain` bean declarations with stateless session policies.
- [ ] Real `@SpringBootTest` smoke test passes green, certifying ApplicationContext initialization (S7-B Gate).

## 5. Useful References
- [Spring Boot 3.3 Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Project Loom & Virtual Threads Best Practices](https://openjdk.org/jeps/444)
- [JEP 450: Compact Object Headers](https://openjdk.org/jeps/450)
