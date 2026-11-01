# Stack Pack: Minecraft Modding (Fabric & Yarn)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Minecraft modding applications built on the Fabric Loader, Fabric Loom, Yarn mappings, and Fabric API.

| Technology | Minimum Version | Required Dependencies | Incompatible With |
|---|---|---|---|
| Minecraft | 1.20.6+ / 1.21+ (Recommended 1.21.x+) | Java 21 LTS (or Java 25 LTS) | Java < 21 |
| Fabric Loader | 0.16.0+ | `fabric-loader` | Forge / NeoForge runtimes directly |
| Fabric Loom | 1.7.0+ | Gradle 8.8+, Loom plugin | Gradle < 8.5 |
| Mappings | Yarn or Mojang Mappings | `net.fabricmc:yarn` | Unmapped bytecode |
| Java Runtime | Java 21 LTS (Recommended 25 LTS) | Eclipse Adoptium / Temurin 21/25 | Java <= 17 on MC 1.20.5+ |

## 2. Architecture Rules
These rules define the physical client/server side isolation, Mixin injection hygiene, registry timing, and 20-TPS tick performance governance for Fabric mods.

- **Physical Client/Server Side Isolation**: Code annotated with `@Environment(EnvType.CLIENT)` or referencing client-only classes (`MinecraftClient`, renderer classes, screen classes) MUST NEVER be imported, referenced, or invoked from common or dedicated server paths. Doing so causes immediate `NoClassDefFoundError` crashes on dedicated servers. All client-only registration MUST occur inside `ClientModInitializer`.
- **Synchronous Registry Timing in `ModInitializer`**: All blocks, items, entity types, and sounds MUST be registered synchronously inside `onInitialize()` before the world engine boots. Deferring registrations or registering dynamically at runtime is strictly PROHIBITED.
- **Mixin Conflict Safety & Avoidance of `@Overwrite`**: Developers MUST NEVER use `@Overwrite` in Mixin classes unless modifying an entire method where no other mod could possibly inject. Developers MUST use `@Inject` (with `cancellable = true` if early return is needed), `@ModifyVariable`, or `@WrapOperation` from MixinExtras, ensuring maximum cross-mod compatibility.
- **Intermediary Mapping Stability**: Production Mixins and bytecode modifications MUST target official Intermediary symbols, not transient deobfuscated Yarn names, ensuring binary compatibility across mod releases.
- **20 TPS Game Tick Rate Discipline**: Logic executing on every tick (`ServerTickEvents.END_SERVER_TICK`, block entity ticking) MUST NOT perform disk I/O, network requests, or unbounded entity loop iterations. Tick processing budgets must stay well below 50ms per tick (20 TPS).
- **Mandatory Runtime Game Bootstrap Smoke Gate (S7-B Gate)**: Unit tests with mocked Minecraft classes alone CANNOT satisfy S7 verification. Any changes modifying Mixins, registries, or network packets MUST execute an automated runtime headless server smoke test (`./gradlew runDatagen` or headless server launch) verifying that Mixins apply cleanly without injection errors and the mod registers without crashing.

## 3. Common Anti-Patterns

#### AP-FABRIC-01: Physical Client Class Leak on Dedicated Server
**What it is**: Directly calling `MinecraftClient.getInstance()` or referencing a screen class in common logic.
**Detection signal**: Using client classes inside a block, item, or common packet handler without side checks.
**Consequence**: The mod runs in the singleplayer development environment, but crashes instantly when installed on a dedicated multiplayer server with `NoClassDefFoundError: net/minecraft/client/MinecraftClient`.
**Correct alternative**: Route side-specific logic through client networking packets or call via `FabricLoader.getInstance().getEnvironmentType()`.

#### AP-FABRIC-02: Destructive `@Overwrite` in Mixins
**What it is**: Completely replacing vanilla Minecraft methods using `@Overwrite`.
**Detection signal**: `@Overwrite` annotations present in Mixin source files.
**Consequence**: Breaks all other mods injecting into the same vanilla method, causing hard crash loops and unresolvable modpack conflicts.
**Correct alternative**: Inject surgically using `@Inject(method = "...", at = @At("HEAD"), cancellable = true)` or `@WrapOperation`.

#### AP-FABRIC-03: Blocking I/O Inside World Tick Loops
**What it is**: Performing synchronous file reading, database queries, or HTTP requests inside `ServerTickEvents`.
**Detection signal**: Blocking operations located inside tick event listeners or `BlockEntity.tick()` methods.
**Consequence**: Freezes the main Minecraft server tick loop, dropping the server tick rate far below 20 TPS and causing extreme rubber-banding and player timeouts.
**Correct alternative**: Offload heavy computations or I/O to a background asynchronous worker thread and schedule results back to the server thread via `server.execute()`.

## 4. Audit Checklist
- [ ] Client classes and `@Environment(EnvType.CLIENT)` logic are strictly isolated to `ClientModInitializer`.
- [ ] No `@Overwrite` annotations are present in Mixins; `@Inject` and MixinExtras are used instead.
- [ ] All blocks, items, and entities are registered synchronously inside `onInitialize()`.
- [ ] Ticking logic is lightweight and free of blocking I/O operations.
- [ ] Mixin configs declare `compatibilityLevel: "JAVA_21"`.
- [ ] Real headless bootstrap smoke test (`runDatagen` or server test) passes green without Mixin errors (S7-B Gate).

## 5. Useful References
- [Fabric Wiki & Documentation](https://fabricmc.net/wiki/)
- [SpongePowered Mixin Documentation](https://github.com/SpongePowered/Mixin/wiki)
- [Fabric Client/Server Side Isolation Guide](https://fabricmc.net/wiki/tutorial:side)
