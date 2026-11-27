# Critical Rules: Java Backend (Spring Boot & Virtual Threads)

This document defines the strict, non-negotiable architectural rules and invariants for projects using Java, Spring Boot, and modern OpenJDK runtimes.

---

## 1. Scope & Target Stack
- **Language / Runtime**: Java 21+ LTS (Recommended Java 25 LTS with Compact Object Headers)
- **Framework**: Spring Boot 3.2+ (Recommended 3.3+ / 3.4+)
- **Security**: Spring Security 6.2+
- **Applicable Files**: `src/main/java/**/*.java`, `build.gradle`, `pom.xml`, `application.yml`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-JAVA-01: Strictly 1 Class / Record / Interface Per File
- Every production class, interface, enum, record, and custom exception MUST reside in its own dedicated `.java` source file matching the top-level type name.
- Static nested classes, non-static inner classes, local records inside methods, and multiple package-private types in a single `.java` file are strictly FORBIDDEN in production code (`src/main/java`).

### RULE-JAVA-02: Zero Compiler Appeasement Pragmas (`@SuppressWarnings`)
- The use of `@SuppressWarnings` (`"unchecked"`, `"rawtypes"`, `"deprecation"`, `"serial"`, `"all"`) in production code is strictly PROHIBITED.
- All code MUST compile with zero compiler warnings under `-Werror` and `-Xlint:all`. Type mismatches and raw types must be resolved structurally.

### RULE-JAVA-03: Virtual Thread Non-Pinning & Lock Modernization
- In applications with virtual threads enabled (`spring.threads.virtual.enabled: true`), production code MUST NOT execute blocking I/O or `Thread.sleep` inside `synchronized` methods or blocks.
- Monitor locks MUST be replaced with `java.util.concurrent.locks.ReentrantLock` or non-blocking concurrency primitives to prevent carrier thread pinning.

### RULE-JAVA-04: Concrete Type Deserialization on REST Clients
- External HTTP REST interactions using Spring `RestClient` or `WebClient` MUST deserialize responses directly into concrete, typed Data Transfer Objects (`record`).
- Deserializing HTTP responses into abstract types (`JsonNode.class`, `Map<String, Object>`, `Object.class`) is strictly FORBIDDEN to eliminate Jackson classpath collisions and runtime type errors.

### RULE-JAVA-05: Mandatory Runtime ApplicationContext Smoke Verification (S7-B Gate)
- Mockito unit tests alone cannot satisfy S7 verification. Any changes modifying bean definitions, `@Autowired` dependencies, configurations, or repository interfaces MUST execute an automated `@SpringBootTest` smoke test asserting that the Spring `ApplicationContext` initializes successfully without `UnsatisfiedDependencyException`.
