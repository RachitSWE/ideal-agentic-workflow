# Stack Pack: Minecraft Mod (NeoForge)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for NeoForge mods. An auditor MUST verify that `gradle.properties`, `build.gradle`, and `neoforge.mods.toml` files comply with these matrices. Correctly specifying version bounds prevents game crashes on launch and ensures compatibility with the latest API breaking changes.

| Target MC Version | NeoForge | Gradle | Java | Allowed Mappings |
|---|---|---|---|---|
| MC 1.21.8 – 1.21.11 | 21.x | 8.x | 21 | Mojang (Parchment optional) |
| MC 26.x | 26.x | ≥ 9.5.1 | 25 | Mojang ONLY (No obfuscation!) |

**Additional Requirements**:
- `neoforge.mods.toml` MUST declare dependency ranges accurately using syntax like `[21.0,22)` for MC 1.21.x targets.
- MC 26.x environments run natively without obfuscation. Deobfuscation assumptions in build scripts MUST be removed for 26.x.

## 2. Architecture Rules
These rules define the structural boundaries of a NeoForge mod. The codebase MUST adhere strictly to these constraints to ensure compatibility, correct event bus targeting, and safe registration. Bypassing these abstractions leads to race conditions and broken registries.

- **@Mod Annotation**: The main class MUST be annotated with `@Mod("modid")`. The Mod ID must precisely match the ID declared in `neoforge.mods.toml` and MUST be entirely lowercase with no special characters.
- **Event Registration Distinction**: The `@EventBusSubscriber` annotation MUST be used on classes to automatically register static event handlers (`@SubscribeEvent`) without manual bus registration. However, if instance-level state is required, the class MUST NOT use `@EventBusSubscriber` and instead manually register the instance using `NeoForge.EVENT_BUS.register(this)` and use `@SubscribeEvent` on non-static methods.
- **DeferredRegister Mandate**: All registry objects (Blocks, Items, Entities, MenuTypes) MUST be registered using the `DeferredRegister` pattern. Direct registration during mod initialization is prohibited as it causes race conditions with NeoForge's internal registry phases.
- **Event Bus Targeting**: Modders MUST explicitly target the correct event bus. Lifecycle events (setup, registry) belong on the Mod bus (`@EventBusSubscriber(bus = Bus.MOD)`). Gameplay events (tick, interaction) belong on the Forge bus (`@EventBusSubscriber(bus = Bus.FORGE)`).
- **Client Code Isolation**: Server code MUST NEVER reference client-only classes. Client-specific event handlers MUST specify `value = Dist.CLIENT` in the `@EventBusSubscriber` annotation to ensure they are not loaded on dedicated servers.
- **Capability System**: The application MUST use the `ICapabilityProvider` registration patterns and NeoForge's attachment system to attach custom data to entities or chunks, rather than relying on mixins or hash maps.
- **Mixin Configuration**: Mixins are allowed but MUST be explicitly declared via the `@MixinConfig` property in the `neoforge.mods.toml` file.
- **No Fabric API**: The mod MUST NOT use Fabric API. If cross-loader support is required, the mod MUST use FFAPI or the Sinytra Connector pattern.

## 3. Common Anti-Patterns
The following anti-patterns highlight the most common architectural mistakes made in NeoForge mod development. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent silent event failures and registry crashes.

#### AP-NEOFORGE-01: Incorrect Event Bus Target
**What it is**: Registering an event handler to the wrong bus, causing the event to never fire.
**Detection signal**: Annotating a `PlayerTickEvent` handler with `@EventBusSubscriber(bus = Bus.MOD)`.
**Consequence**: The event handler is completely ignored by the game engine, resulting in silent feature failure.
**Correct alternative**: Use `bus = Bus.FORGE` for runtime/gameplay events, and `bus = Bus.MOD` for initialization/registry events.

#### AP-NEOFORGE-02: Eager Registry Instantiation
**What it is**: Instantiating a Block or Item as a static final field outside of the `DeferredRegister` framework.
**Detection signal**: `public static final Block MY_BLOCK = new Block(...)` declared at the class level without a `DeferredRegister` wrapper.
**Consequence**: The item is instantiated before the game's registry is ready, leading to crashes or missing items in-game.
**Correct alternative**: Wrap the instantiation in a `DeferredRegister.create()` call and register it via `register(name, () -> new Block(...))`.

#### AP-NEOFORGE-03: Missing Mixin Declaration
**What it is**: Adding a Mixin to the project but failing to declare it in the mod's configuration file.
**Detection signal**: A `mixins.json` file exists and is populated, but `neoforge.mods.toml` lacks the necessary configuration linking to it.
**Consequence**: The mixins silently fail to apply at runtime.
**Correct alternative**: Add `[[mixins]]` and `config="modid.mixins.json"` to the `neoforge.mods.toml` file.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a NeoForge mod. Failure to check these items may result in catastrophic compatibility issues, registry deadlocks, or broken event loops.
- [ ] Version constraints (NeoForge, Gradle, Java) strictly match the target MC version.
- [ ] Dependency version ranges in `neoforge.mods.toml` are correctly formatted (e.g., `[21.0,22)`).
- [ ] All Blocks, Items, and Entities use the `DeferredRegister` pattern.
- [ ] Event handlers explicitly define the correct bus (`MOD` vs `FORGE`).
- [ ] Client-only event subscribers use `value = Dist.CLIENT`.
- [ ] Mixin configs are properly declared in `neoforge.mods.toml`.
- [ ] No Fabric API classes are imported.
- [ ] `@Mod` annotation exactly matches the ID in `neoforge.mods.toml`.

## 5. Useful References
The following resources provide authoritative guidance on developing resilient Minecraft mods using the NeoForge toolchain. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions regarding event buses, data attachments, or registries. Referencing these guides ensures the mod correctly utilizes modern NeoForge capabilities.
- [NeoForge Documentation: Concepts](https://docs.neoforged.net/docs/concepts/): Fundamental concepts outlining the mod initialization lifecycle.
- [NeoForge DeferredRegister](https://docs.neoforged.net/docs/concepts/registries/): Standard patterns for declaring blocks, items, and block entities.
- [NeoForge Event System](https://docs.neoforged.net/docs/concepts/events/): Detailed documentation on the differences between the Mod bus and Forge bus.
- [SpongePowered Mixin Documentation](https://github.com/SpongePowered/Mixin/wiki): The official reference for mixin configurations and annotations.
