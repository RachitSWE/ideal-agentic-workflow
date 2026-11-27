# Critical Rules: Minecraft Modding (Fabric & Yarn)

This document defines the strict, non-negotiable architectural rules and invariants for projects modding Minecraft via the Fabric Loader, Fabric Loom, and Yarn mappings.

---

## 1. Scope & Target Stack
- **Game Engine**: Minecraft 1.20.6+ / 1.21+ (Java 21 LTS runtime)
- **Mod Loader**: Fabric Loader 0.15+, Fabric Loom 1.7+, Fabric API
- **Mappings**: Yarn or official Mojang mappings
- **Applicable Files**: `src/main/java/**/*.java`, `fabric.mod.json`, `*.mixins.json`

---

## 2. Hard Invariants (Zero Exceptions)

### RULE-FABRIC-01: Strict Physical Client / Server Dist Isolation
- Code annotated with `@Environment(EnvType.CLIENT)` or referencing client-only classes (`MinecraftClient`, `Screen`, `EntityRenderer`, `KeyBinding`) MUST NEVER be imported, referenced, or invoked from common code or dedicated server paths.
- All client-only registrations MUST reside inside `ClientModInitializer`. Violating side isolation causes immediate `NoClassDefFoundError` crashes on dedicated multiplayer servers.

### RULE-FABRIC-02: Zero Destructive Method Overwrites in Mixins
- The use of `@Overwrite` in Mixin classes is strictly FORBIDDEN.
- Bytecode hooks MUST use non-destructive injectors: `@Inject` (with `cancellable = true` for conditional early returns), `@ModifyVariable`, or `@WrapOperation` from MixinExtras to ensure compatibility with other mods.

### RULE-FABRIC-03: Synchronous Registry Timing in `onInitialize()`
- All blocks, items, entity types, and sounds MUST be registered synchronously inside `ModInitializer.onInitialize()` before world initialization begins. Dynamic or deferred registration at runtime is prohibited.

### RULE-FABRIC-04: 20 TPS Tick Budget & Non-Blocking Server Threads
- Code executing within server tick listeners (`ServerTickEvents.END_SERVER_TICK`) or block entity ticking methods MUST NOT perform blocking file I/O, synchronous network requests, or unbounded entity loop iterations.
- Heavy computations MUST be offloaded to worker threads (`CompletableFuture.runAsync`) and world mutations scheduled back to the main thread via `server.execute()`.

### RULE-FABRIC-05: Zero Garbage Collector Churn in High-Frequency Loops
- Coordinate and entity iteration loops ticking at 20 TPS MUST reuse mutable coordinate primitives (`BlockPos.Mutable`) instead of instantiating thousands of immutable `new BlockPos()` objects per second, preventing GC pauses.

### RULE-FABRIC-06: Mandatory Runtime Game Bootstrap Smoke Gate (S7-B Gate)
- Unit tests with mocked classes alone cannot satisfy S7 verification. Any changes modifying Mixins, registries, or packets MUST execute an automated headless server smoke test (`./gradlew runDatagen` or server test) verifying that Mixins apply cleanly without injection errors.
