# Stack Pack: Minecraft Mod (Fabric)

## 1. Version Constraint Matrix
This section defines the supported versions and compatibility requirements for Fabric mods. An auditor MUST verify that `gradle.properties` and `build.gradle` files comply with these strict matrices. Strict adherence to these versions ensures the mod compiles against the correct mappings and game APIs.
**Note**: The ecosystem splits severely between 1.21.x and 26.x.

| Target MC Version | Fabric Loom | Gradle | Java | Allowed Mappings |
|---|---|---|---|---|
| MC 1.21.8 – 1.21.11 | ≤ 1.16 | 8.x | 21 | Yarn OR Mojang |
| MC 26.x | ≥ 1.17 | ≥ 9.5.1 | 25 | Mojang ONLY |

**Additional 26.x Constraints**:
- MC 26.2+ requires the Blaze3D API. Raw OpenGL calls are prohibited due to the experimental Vulkan backend.
- Yarn mappings are officially unsupported for 26.x and MUST NOT be used.

## 2. Architecture Rules
These rules define the structural boundaries of a Fabric mod. The codebase MUST adhere strictly to these constraints to ensure server/client stability and registry timing. Failing to respect these boundaries will cause dedicated servers to crash upon initialization.

- **Initializer Split Rules**: The mod MUST separate its entry points. `ModInitializer` is for common code (registries, common events). `ClientModInitializer` is exclusively for client-side code (rendering, screens, keybinds). `DedicatedServerModInitializer` is exclusively for server-side behavior.
- **Client Code Isolation**: Server and common code MUST NEVER reference client-only classes (e.g., `MinecraftClient`, `Screen`, rendering classes). The `@Environment(EnvType.CLIENT)` annotation MUST be respected, and violating this boundary will cause dedicated servers to crash on startup.
- **Registry Entry Timing**: All registry entries (Blocks, Items, Entities) MUST be registered synchronously within the `onInitialize()` method of the `ModInitializer`. Lazy registration or registering items during gameplay events is strictly prohibited.
- **Dependency Declarations**: The `fabric.mod.json` file MUST accurately declare dependencies in the `depends`, `recommends`, and `breaks` fields. This includes declaring a dependency on `fabric-api` if its modules are used.
- **Event Handler Patterns**: The application MUST use the Fabric API Event system (e.g., `ServerTickEvents.END_SERVER_TICK.register(...)`) for callbacks rather than resorting to mixins for standard hooks.

## 3. Common Anti-Patterns
The following anti-patterns highlight the most common architectural mistakes made in Fabric mod development. Auditors MUST actively scan the codebase for these specific scenarios during the S2 and S8 phases to prevent mod incompatibility and dedicated server crashes.

#### AP-FABRIC-01: Client Code Bleed in Common Setup
**What it is**: Referencing client-only classes from within the main `ModInitializer` or common event handlers.
**Detection signal**: Importing `net.minecraft.client.MinecraftClient` or setting up a `KeyBinding` inside the class that implements `ModInitializer`.
**Consequence**: The mod works perfectly in the single-player development environment but crashes instantly with a `ClassNotFoundException` when deployed to a dedicated server.
**Correct alternative**: Move all client-side logic to a separate class that implements `ClientModInitializer`.

#### AP-FABRIC-02: Overwriting Core Methods via Mixin
**What it is**: Using the `@Overwrite` annotation in a Mixin to completely replace a vanilla method.
**Detection signal**: The presence of `@Overwrite` in any Mixin class.
**Consequence**: Absolute incompatibility with any other mod that attempts to modify the same method, breaking the mod ecosystem.
**Correct alternative**: Use `@Inject` (with `cancellable = true` if necessary), `@ModifyVariable`, or `@ModifyReturnValue` to alter behavior cooperatively.

#### AP-FABRIC-03: Raw OpenGL in 26.2+
**What it is**: Using raw `GL11` or `RenderSystem` calls that bypass the abstraction layer in modern Minecraft.
**Detection signal**: Direct calls to `GL11.glEnable()` or similar low-level GL commands.
**Consequence**: The mod will crash or render incorrectly when the Vulkan backend is enabled in MC 26.2+.
**Correct alternative**: Use the Blaze3D API and the `MatrixStack` / `VertexConsumer` systems provided by Minecraft.

## 4. Audit Checklist
An auditor MUST verify the following items when reviewing a Fabric mod. Failure to check these items may result in catastrophic compatibility issues, unstable mixins, or a broken build process.
- [ ] Version constraints (Loom, Gradle, Java, Mappings) strictly match the target MC version.
- [ ] No client-only classes are referenced in `ModInitializer` or common code.
- [ ] All registries are initialized synchronously in `onInitialize()`.
- [ ] Mixins do not use the `@Overwrite` annotation.
- [ ] `fabric.mod.json` correctly declares all dependencies and incompatibilities.
- [ ] For MC 26.2+ targets, no raw OpenGL calls exist.

## 5. Useful References
The following resources provide authoritative guidance on developing resilient Minecraft mods using the Fabric toolchain. Agents and developers MUST consult these documents when encountering ambiguous architectural decisions regarding networking, mixins, or the registry system. Referencing these guides ensures the mod remains compatible with the wider ecosystem.
- [Fabric Wiki: Environment isolation](https://fabricmc.net/wiki/tutorial:side): Deep dive on the distinction between the logical and physical server/client.
- [Fabric Wiki: Mixin Introduction](https://fabricmc.net/wiki/tutorial:mixin): Guidelines for writing safe, compatible mixins.
- [Fabric Registry Guidelines](https://fabricmc.net/wiki/tutorial:registry): Details on how and when to register new items and blocks.
- [SpongePowered Mixin Documentation](https://github.com/SpongePowered/Mixin/wiki): The official, comprehensive reference for all mixin annotations.
